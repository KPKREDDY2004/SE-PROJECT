# SE-PROJECT
NOTE:- Kindly see this readme file in code formate not in preview because you will understand how your foulder structure should be which will make clear understanding

firstly we need to create a project foulder. And inside the foulder we need to create a public foulder in that foulder place your .html, .js and .css. If there are any photos place thim in public foulder. And all the package.json files and server.js file should not be in public foulder they should be in main project foulder. Brelow is the example of foulder structure

calendar-app/
│
├── public/                       # All frontend files served statically
│   ├── admin.css
│   ├── home.css
│   ├── home.html
│   ├── home.js
│   ├── index.html               # Admin dashboard
│   ├── login.html
│   ├── login.js
│   ├── script.js
│   ├── styles.css
│   └── MU_Building_2_12.jpg     # Background image
│
├── server.js                    # All backend logic (Express, MongoDB, Socket.IO)
├── package.json                 # Project metadata and dependencies
└── .env                         # Environment variables (Mongo URI, JWT secret, etc)


firt to run the codes we need to install some packages and extensions in vscode
1. install html and css extension
2. install bootstrap 4
3. install live server
4. and node.js forom the provided link https://nodejs.org/en

After we need to install some package. I have provided the command below

1. npm install
2. npm init -y
3. npm install express mongoose cors jsonwebtoken bcryptjs socket.io

for database we are using mongodb atls. First we need to visit https://cloud.mongodb.com where we need to create an account and create a databasewe need to . There we need to name your database and we need to provide an password for connection. After that we will get a cluster which should be pasted in your server.js.

To run the code, in terminal we need to type the following command
node server.js and press enter.

we will get message like this:
PS C:\Users\DELL\OneDrive\Desktop\seee proj> node server.js
🚀 Server running at http://localhost:5000
✅ MongoDB connected

on the http://localhost:5000 pess control and click or type manually in google or chrome.
we will see admin dashboard in the go to the user section on the sidebar we the admin can create users and change passwors if user want and also delete users.

Technologies Used
FrontEnd : HTML & CSS 
BackEnd : JavaScript
DataBase : MongoDB Atlas
Once admin creates user in the search type http://localhost:5000/login.html which will take you to login page login with the same email and password were adimn entered. If your login is successful you will be diverted to home.html.
In home.html page we can create an event with name of an event which includes date and time and also venue. And we also have a feature where users can create and delete events parallely. And we also make shoure that there will be no double booking in on same date and time and also same venue also. If we try to book we will get message like this slot is booked by with that persons email.
All the details like usere details and events will be posted to database.

video link of our presentation: 
