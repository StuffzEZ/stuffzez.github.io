#!/bin/bash

# THIS IS A DOCKER DESKTOP INSTALL SCRIPT FOR ZORIN OS (Mainly)

echo "Welcome To Stuf_y's Docker Desktop Installer Script! (Originally Zorin)."
sleep 1

# Detect OS
OS_ID=$(grep ^ID= /etc/os-release | cut -d= -f2 | tr -d '"')
OS_NAME=$(grep ^PRETTY_NAME= /etc/os-release | cut -d= -f2 | tr -d '"')

echo "Detected OS: $OS_NAME"

# Only continue for Ubuntu or Zorin
if [[ "$OS_ID" != "ubuntu" && "$OS_ID" != "zorin" ]]; then
    echo "This script only supports Ubuntu or Zorin OS. Exiting."
    exit 1
fi

# Ask user if they want to install Docker
read -p "Do you want to install Docker Desktop? (y/n): " INSTALL_DOCKER
if [[ "$INSTALL_DOCKER" != "y" ]]; then
    echo "Installation canceled by user."
    exit 0
fi

echo "Adding Docker Repository..."
sleep 2

# Prepare and add Docker repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Get codename (for example: focal, jammy)
CODENAME=$(lsb_release -cs)

# Add Docker source
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $CODENAME stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update apt cache
sudo apt-get update

echo "Downloading Docker Desktop package..."
sleep 2
wget "https://desktop.docker.com/linux/main/amd64/docker-desktop-amd64.deb"

echo "Downloaded Docker Desktop!"
sleep 1

# Ask if user wants to upgrade packages
read -p "Do you want to run 'apt upgrade' before installing Docker Desktop? (y/n): " UPGRADE_SYSTEM
if [[ "$UPGRADE_SYSTEM" == "y" ]]; then
    echo "Upgrading system packages..."
    sleep 2
    sudo apt-get upgrade -y
fi

# Install Docker Desktop
echo "Installing Docker Desktop..."
sudo apt-get install -y ./docker-desktop-amd64.deb

echo "Docker Desktop installation completed!"
