#!/usr/bin/env python3
"""
Setup script for the inventory management backend.
This script installs dependencies and sets up the development environment.
"""

import os
import subprocess
import sys
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"Running: {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def main():
    """Main setup function."""
    print("Setting up Inventory Management Backend...")
    
    # Get the backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Install Python dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        print("Failed to install dependencies. Please run manually:")
        print("pip install -r requirements.txt")
        return False
    
    # Create logs directory
    logs_dir = backend_dir / 'logs'
    if not logs_dir.exists():
        logs_dir.mkdir()
        print("✓ Created logs directory")
    
    # Copy .env.example to .env if .env doesn't exist
    env_file = backend_dir / '.env'
    env_example = backend_dir / '.env.example'
    
    if not env_file.exists() and env_example.exists():
        import shutil
        shutil.copy(env_example, env_file)
        print("✓ Created .env file from .env.example")
        print("⚠️  Please edit .env file with your configuration")
    
    # Run migrations
    if not run_command("python manage.py migrate", "Running database migrations"):
        print("Migration failed. You may need to run this manually after setup.")
    
    print("\n🎉 Setup completed!")
    print("\nNext steps:")
    print("1. Edit .env file with your configuration")
    print("2. Create a superuser: python manage.py createsuperuser")
    print("3. Start the server: python manage.py runserver")
    
    return True

if __name__ == "__main__":
    main()
