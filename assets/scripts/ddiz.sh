#!/bin/bash

# Welcome message
echo "Welcome To Stuf_y's Zorin Docker Desktop Installer Script!"

# Inform about adding Docker repository
echo "Adding Docker Repository.."
sleep 2  # 2 Second Wait

# Update package index and install prerequisites
sudo apt-get update
sudo apt-get install -y ca-certificates curl

# Create keyrings directory if it doesn't exist
sudo install -m 0755 -d /etc/apt/keyrings

# Download Docker GPG key
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker repository to Apt sources
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index again after adding Docker repository
sudo apt-get update

# Notify user
echo "Added Repository!"
sleep 2  # 2 Second Wait

# Download the Docker Desktop Debian package
echo "Downloading Debian Package.."
sleep 2  # 2 Second Wait
wget "https://desktop.docker.com/linux/main/amd64/docker-desktop-amd64.deb"

# Notify user of download completion
echo "Downloaded Debian Package!"
sleep 1  # 1 Second Wait

# Update before upgrade
echo "Updating.."
sleep 2  # 2 Second Wait
sudo apt-get update

# Upgrade existing packages
echo "Upgrading.."
sleep 2  # 2 Second Wait
sudo apt-get upgrade -y

# Install the downloaded Docker Desktop package
sudo apt-get install -y ./docker-desktop-amd64.deb
