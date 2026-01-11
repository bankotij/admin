"""Seed script - only seeds if database is empty."""
import asyncio
import sys
from app.core.database import engine
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.project import Project, ProjectStatus, ProjectPriority
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy import text, select, func

async def seed():
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check if users already exist
        result = await session.execute(select(func.count(User.id)))
        user_count = result.scalar_one()
        
        if user_count > 0:
            print(f"Database already has {user_count} users. Skipping seed.")
            return
        
        print("Database is empty. Seeding...")
        
        # Create users with proper password hashes
        admin = User(
            email="admin@example.com",
            full_name="Admin User",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.admin,
            is_active=True
        )
        manager = User(
            email="manager@example.com", 
            full_name="Manager User",
            hashed_password=get_password_hash("manager123"),
            role=UserRole.manager,
            is_active=True
        )
        viewer = User(
            email="viewer@example.com",
            full_name="Viewer User", 
            hashed_password=get_password_hash("viewer123"),
            role=UserRole.viewer,
            is_active=True
        )
        
        session.add_all([admin, manager, viewer])
        await session.commit()
        print("Created 3 users")
        
        # Refresh to get IDs
        await session.refresh(admin)
        await session.refresh(manager)
        
        # Create projects
        p1 = Project(
            name="Website Redesign",
            description="Complete website overhaul with modern design",
            status=ProjectStatus.active,
            priority=ProjectPriority.high,
            budget=50000_00,  # $50,000 in cents
            owner_id=admin.id
        )
        p2 = Project(
            name="Mobile App",
            description="iOS and Android app development",
            status=ProjectStatus.draft,
            priority=ProjectPriority.medium,
            budget=100000_00,
            owner_id=manager.id
        )
        p3 = Project(
            name="API Integration",
            description="Third-party payment and shipping integrations",
            status=ProjectStatus.active,
            priority=ProjectPriority.critical,
            budget=25000_00,
            owner_id=admin.id
        )
        
        session.add_all([p1, p2, p3])
        await session.commit()
        print("Created 3 projects")
        
        print("\n✅ Database seeded successfully!")
        print("\nLogin credentials:")
        print("  admin@example.com / admin123")
        print("  manager@example.com / manager123")
        print("  viewer@example.com / viewer123")

if __name__ == "__main__":
    asyncio.run(seed())
