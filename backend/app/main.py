from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

from . import models, schemas, auth
from .database import engine, get_db
from .llm_service import llm_service
from .document_service import document_service

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Document Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.post("/projects", response_model=schemas.Project)
def create_project(
    project: schemas.ProjectCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_project = models.Project(
        title=project.title,
        document_type=project.document_type,
        outline=project.outline,
        user_id=current_user.id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects", response_model=List[schemas.Project])
def list_projects(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    projects = db.query(models.Project).filter(
        models.Project.user_id == current_user.id
    ).all()
    return projects

@app.get("/projects/{project_id}", response_model=schemas.Project)
def get_project(
    project_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return project

@app.put("/projects/{project_id}", response_model=schemas.Project)
def update_project(
    project_id: int,
    project_update: schemas.ProjectUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project_update.title:
        project.title = project_update.title
    if project_update.outline:
        project.outline = project_update.outline
    if project_update.content:
        project.content = project_update.content
    
    db.commit()
    db.refresh(project)
    return project

@app.delete("/projects/{project_id}")
def delete_project(
    project_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

@app.post("/generate-outline")
def generate_outline(
    topic: str,
    document_type: str,
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        outline = llm_service.generate_outline(topic, document_type)
        return {"outline": outline}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-content/{project_id}")
def generate_content(
    project_id: int,
    request: schemas.GenerateContentRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        result = llm_service.generate_content(
            request.outline,
            request.document_type,
            request.additional_instructions
        )
        
        # Delete existing sections
        db.query(models.Section).filter(models.Section.project_id == project_id).delete()
        
        # Create new sections
        for section_data in result["sections"]:
            section = models.Section(
                title=section_data["title"],
                content=section_data["content"],
                order=section_data["order"],
                project_id=project_id
            )
            db.add(section)
        
        db.commit()
        db.refresh(project)
        
        return {"message": "Content generated successfully", "sections": result["sections"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/refine-section/{section_id}")
def refine_section(
    section_id: int,
    request: schemas.RefineContentRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    section = db.query(models.Section).join(models.Project).filter(
        models.Section.id == section_id,
        models.Project.user_id == current_user.id
    ).first()
    
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    try:
        refined_content = llm_service.refine_content(
            request.current_content,
            request.refinement_instructions
        )
        
        section.content = refined_content
        db.commit()
        
        return {"content": refined_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/export/{project_id}")
def export_document(
    project_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        if project.document_type == "docx":
            file_stream = document_service.create_docx(project)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = f"{project.title}.docx"
        else:
            file_stream = document_service.create_pptx(project)
            media_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            filename = f"{project.title}.pptx"
        
        return StreamingResponse(
            file_stream,
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
