### What is this package

This package is template package for quickly creating a React website that gets served from a 
ExpressJS backend server.

Planned for up coming revisions:

- Mocha + Chai for testing 
- Maybe better styling support  

### Running the package during development

```
npm insall // installs the needed dependencies 

npm run clean // deletes all the build artifacts

npm run build // builds the website and the backend service

npm run server // runs the website and api 
```

### Initial Set Up Typescript (MacOs)

#### Install Homebrew

https://brew.sh/

#### Install NVM 

Fish Shell: 
https://brandonscript.design/making-nvm-work-with-fish-shell-in-2023-f4a7990ac12c

#### Install NVM

https://nodejs.org/en/download/package-manager

```
# download and install Node.js
nvm install 20

# verifies the right Node.js version is in the environment
node -v # should print `v20.14.0`

# verifies the right NPM version is in the environment
npm -v # should print `10.7.0`
```

### Initial Set Up for the Book Processor (Python)

#### Install Hatch 

> **NOTE**: You need to have your Gemini API Key set in a variable called 'GEMINI_API_KEY'.

```
brew install hatch 
cd book-processor/book-processor

(for Shelby, do "npm run env" then "source ../../.env)
hatch run python src/book_processor/learning_objectives.py --book-path '<PATH_TO_PDF>'
```

### Testing API

#### Users 

##### Get By Email

```
curl -H 'Content-Type: application/json' \
    -d '{ "email":"jake@google.com" }' \
    -X POST \
    http://localhost:3000/api/user
```

#### Classes 

##### Create 

```
curl -H 'Content-Type: application/json' \
    -d '{ "title":"Jake test class", "sourceID":"Jakesource", "creatorID":"jakesutton" }' \
    -X POST \
    http://localhost:3000/api/class/create
```

##### List

```
curl -H 'Content-Type: application/json' \
    -d '{ "userID":"5EA38EBD-AFDC-4730-B90D-6AA966688902" }' \
    -X POST \
    http://localhost:3000/api/classes
```

##### Get 

```
curl -H 'Content-Type: application/json' \
    -d '{ "classID":"cedc1ab9-b64f-4d5c-a2ff-63e652b7877f" }' \
    -X POST \
    http://localhost:3000/api/class
```

```
curl -H 'Content-Type: application/json' \
    -d '{ "classID":"62788d09-06dc-4789-bc2d-ed70b7ee9b5a" }' \
    -X POST \
    http://localhost:3000/api/chapters
```

#### Books 

##### Status

```
curl -H 'Content-Type: application/json' \
    -d '{ "sourceID":"d3976eb2-163c-4ade-965f-4dca1af80ef0" }' \
    -X POST \
    http://localhost:3000/api/book/status
```

```
curl -H 'Content-Type: application/json' \
    -d '{ "title":"foo","body":"bar", "id": 1}' \
    -X POST \
    http://localhost:3000/api/session
```

curl -H 'Content-Type: application/json' \
    -d '{ "book_name":"test" }' \
    -X POST \
    http://localhost:8000/api/v1/book/toc

Check the status of book processing 

curl -X GET http://localhost:8000/api/v1/book/toc/<sourceID>/status