import tkinter as tk
from tkinter import ttk
import time
import os
import urllib.request
from io import BytesIO
from tkinter import *
from tkinter.ttk import *
import time

def download_image(url, filename):
    urllib.request.urlretrieve(url, filename)

def resize_image(image_filename, max_width, max_height):
    with open(image_filename, 'rb') as f:
        img_data = f.read()

    img = tk.PhotoImage(data=img_data)

    # Resize the image while preserving aspect ratio
    width = img.width()
    height = img.height()

    aspect_ratio = width / height

    if aspect_ratio > 1:  # Landscape
        new_width = min(width, max_width)
        new_height = int(new_width / aspect_ratio)
    else:  # Portrait
        new_height = min(height, max_height)
        new_width = int(new_height * aspect_ratio)

    resized_img = img.subsample(max(int(width / new_width), 1), max(int(height / new_height), 1))
    return resized_img

def open_main():
    os.system("python3 main.py")

# Download the image from the URL
image_url = "https://dl.dropboxusercontent.com/scl/fi/zvlbu0v9j0ucy52gr0v2e/Web-Bookmarks-Made-With-Adobe-Express.png?rlkey=opqme1yar5zl5rvu7za1m02gb&dl=0"
image_filename = "splash_image.png"
download_image(image_url, image_filename)

# Create the splash screen window
root = tk.Tk()
root.overrideredirect(True)  # Remove title bar and borders

# Get screen width and height
screen_width = root.winfo_screenwidth()
screen_height = root.winfo_screenheight()

# Calculate position for centering the window
x = (screen_width - 400) // 2
y = (screen_height - 250) // 2
root.geometry(f"400x300+{x}+{y}")  # Set window size and position

root.resizable(False, False)  # Make window non-resizable
root.iconbitmap("")  # Remove icon from taskbar

# Background
background_label = tk.Label(root, bg="cyan", width=400, height=300)
background_label.place(x=0, y=0, relwidth=1, relheight=1)

# Frame for program name
program_frame = tk.Frame(root, bg="cyan")
program_frame.pack(pady=10)

# Add program name
program_name_label = tk.Label(program_frame, text="Bookmarks Manager", font=("Trebuchet Ms", 20), bg="cyan")
program_name_label.pack()

# Frame for image
image_frame = tk.Frame(root, bg="cyan")
image_frame.pack(pady=10)

# Resize the image
max_width = 300
max_height = 200
resized_img = resize_image(image_filename, max_width, max_height)

# Add image
image_label = tk.Label(image_frame, image=resized_img, bg="cyan")
image_label.pack()

def start():
    GB = 100
    download = 0
    speed = 1
    while(download<GB):
        time.sleep(0.05)
        bar['value']+=(speed/GB)*100
        download+=speed
        percent.set(str(int((download/GB)*100))+"%")
        text.set(str(download)+"/"+str(GB)+" GB completed")
        root.update_idletasks()
    root.after(10000, open_main)  # Open main window after 10 seconds

percent = StringVar()
text = StringVar()

bar = Progressbar(root, orient="horizontal", length=300)
bar.pack(pady=10)

percentLabel = Label(root, textvariable=percent)
percentLabel.pack()
taskLabel = Label(root, textvariable=text)
taskLabel.pack()

start()
# Frame for tip
tip_frame = tk.Frame(root, bg="cyan")
tip_frame.pack(pady=10)

# Add tip
tip_label = tk.Label(tip_frame, text="Did You Know This Project Was Made In Python?", font=("Trebuchet Ms", 12), bg="cyan")
tip_label.pack()

root.mainloop()