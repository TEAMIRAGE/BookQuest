(Team Mirage)
Library Management System - Afourathon
# Program file structure
Folders and files are already provided in an structured way. 

*NOTE* You have to add command "npm i" or "npm install" before running the program in your local environment.

Only use this command once on every installation of the given program.

*NOTE* You should create a new file named as "config.env" and create 6 variables named as "PORT", "IP", "MONGO_URI", "GCP_PROID", "GCP_BUCKET_NAME" and "SECRET_JWT_KEY".

The "PORT" variable will consist the port number that you will provide, "ID" variable will contain address of application, "MONGO_URI" variable will contain your personal link String for mongoDB connection, "GCP_PROID" will contain your google cloud platform project id, "GCP_BUCKET_NAME" will consist of your bucket name and finally "SECRET_JWT_KEY" variable will contain any random string that you want to set for token validation process used in authentication.

*NOTE* Add your gcp service account key in the main repository(Json format file). In program whereever this service account key named as 
"tokyo_silicon_379808b9b938fc0c90.json" is present, replace it with your own service account key(json file).