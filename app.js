const floorplanData = {
    Rooms: [
        {
            name: "Bedroom",
            points: [
                [50, 50],
                [300, 50],
                [300, 270],
                [50, 270],
            ],
        },
        {
            name: "Living Room",
            points: [
                [350, 135],
                [600, 135],
                [600, 420],
                [350,420],
            ],
        },
        {
            name: "Kitchen",
            points: [
                [50, 300],
                [300, 300],
                [300, 550],
                [50, 550],
            ],
        },
    ],
    Doors: [
        { x: 298, y: 170, width: 50, height: 50, name: "Bedroom to Living Room", imgSrc: "img/doors.png"},
        { x: 299, y: 350, width: 50, height: 50, name: "Kitchen to Living Room", imgSrc: "img/doors.png" },
    ],
    Furnitures: [
        { equipName: "Bedroom", x: 1, y: 10, width: 350, height: 295, imgSrc: "img/2.png" },
        { equipName: "living room", x: 330, y: 120, width:300, height: 305, imgSrc: "img/3.png" },
        { equipName: "kickhen", x: 52, y: 300, width: 246, height: 250, imgSrc: "img/1.png" },
    ],
};

const canvas = document.getElementById("floorplanCanvas");
const ctx = canvas.getContext("2d");
const hoverInfo = document.getElementById("hoverInfo");
canvas.width = 700;
canvas.height = 600;

let scale = 1; // Zoom level
let panX = 0;  // Horizontal panning offset
let panY = 0;  // Vertical panning offset

// Load equipment images
const images = {};
floorplanData.Furnitures.forEach(furniture => {
    const img = new Image();
    img.src = furniture.imgSrc;
    images[furniture.equipName] = img;
});

function drawDoors() {
    floorplanData.Doors.forEach((door) => {
        const img = new Image();
        img.src = door.imgSrc;

        // Check if the image has loaded
        img.onload = () => {
            // Draw the door image, adjusting for scale and pan
            ctx.drawImage(img, (door.x + panX) * scale, (door.y + panY) * scale, door.width * scale, door.height * scale);
        };

        // If the image is not yet loaded or fails to load, draw a red rectangle as a placeholder
        img.onerror = () => {
            ctx.fillStyle = "#FF0000";
            ctx.fillRect((door.x + panX) * scale, (door.y + panY) * scale, door.width * scale, door.height * scale);
        };
    });
}

function drawFurniture() {
    floorplanData.Furnitures.forEach((furniture) => {
        const img = images[furniture.equipName];
        if (img.complete) {
            // Draw the image, adjusting for scale and pan
            ctx.drawImage(img, (furniture.x + panX) * scale, (furniture.y + panY) * scale, furniture.width * scale, furniture.height * scale);
        } 
        // else {
        //     // If the image hasn't loaded yet, draw a green rectangle as a placeholder
        //     ctx.fillStyle = "#00FF00"; 
        //     ctx.fillRect((furniture.x + panX) * scale, (furniture.y + panY) * scale, furniture.width * scale, furniture.height * scale);
        // }
    });
}
function handleHover(mouseX, mouseY) {
    let hoverFound = false;

    floorplanData.Furnitures.forEach((furniture) => {
        if (
            mouseX >= (furniture.x + panX) * scale &&
            mouseX <= (furniture.x + panX + furniture.width) * scale &&
            mouseY >= (furniture.y + panY) * scale &&
            mouseY <= (furniture.y + panY + furniture.height) * scale
        ) {
            // Dynamically choose a different image src for each furniture
            let hoverImageSrc;
            switch (furniture.equipName) {
                case "Bedroom": hoverImageSrc = "img/bedroom.jpg"; // Replace with the actual path to the image
                    break;
                case "Sofa":
                    hoverImageSrc = 
                    "img/livingroom.jpg"; // Replace with the actual path to the image
                    break;
                case "kickhen":
                    hoverImageSrc = "img/kichten.jpg"; // Replace with the actual path to the image
                    break;
                default:
                    hoverImageSrc = furniture.imgSrc; // Default to the original image source if no specific one is provided
            }

            // Display the image of the furniture in hoverInfo
            hoverInfo.style.left = `${mouseX + 10}px`;
            hoverInfo.style.top = `${mouseY + 50}px`;
            hoverInfo.style.display = "block";
            
            // Set the content to the dynamic image
            hoverInfo.innerHTML = `
                <h1>${furniture.equipName}</h1>
                <img src="${hoverImageSrc}" alt="${furniture.equipName}" style="width: 350px; height: auto;">`;
            
            hoverFound = true;
        }
    });

    if (!hoverFound) {
        floorplanData.Doors.forEach((door) => {
            if (
                mouseX >= (door.x + panX) * scale &&
                mouseX <= (door.x + panX + door.width) * scale &&
                mouseY >= (door.y + panY) * scale &&
                mouseY <= (door.y + panY + door.height) * scale
            ) {
                let hoverImageSrc = door.imgSrc; // You can also assign different images for doors

                // Display the image of the door in hoverInfo
                hoverInfo.style.left = `${mouseX + 10}px`;
                hoverInfo.style.top = `${mouseY + 10}px`;
                hoverInfo.style.display = "block";
                
                hoverInfo.innerHTML = `
                    <h1>${door.name}</h1>
                    <img src="${hoverImageSrc}" alt="${door.name}" style="width: 100px; height: auto;">`;
                
                hoverFound = true;
            }
        });
    }

    if (!hoverFound) {
        hoverInfo.style.display = "none";
    }
}




// Mousemove event for hovering
canvas.addEventListener("mousemove", (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    handleHover(mouseX, mouseY);
});

// Zoom functionality
canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomAmount = 0.1;
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    const x = (mouseX - panX) / scale;
    const y = (mouseY - panY) / scale;

    scale += e.deltaY * -zoomAmount;
    scale = Math.max(0.1, Math.min(5, scale)); // Clamp zoom level

    panX = mouseX - x * scale;
    panY = mouseY - y * scale;

    redraw();
});

// Panning functionality
let isDragging = false;
let startX, startY;

canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.offsetX - panX;
    startY = e.offsetY - panY;
});

canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
        panX = e.offsetX - startX;
        panY = e.offsetY - startY;
        redraw();
    }
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
});

function drawRooms() {
    floorplanData.Rooms.forEach(room => {
        // Set the stroke style to a dark color (e.g., black) and a thicker line width
        ctx.strokeStyle = "#000000"; // Set the color to black
        ctx.lineWidth = 5;           // Increase the line width to make it bold

        ctx.beginPath();
        ctx.moveTo((room.points[0][0] + panX) * scale, (room.points[0][1] + panY) * scale);
        room.points.forEach(point => {
            ctx.lineTo((point[0] + panX) * scale, (point[1] + panY) * scale);
        });
        ctx.closePath();
        ctx.stroke(); // Apply the stroke with the new style
    });
}
 
function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    drawRooms();
    drawDoors();
    drawFurniture();
    ctx.restore();
}

redraw();
