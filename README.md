# My Node.js School Management API

A Node.js-based application that manages users, schools, classrooms, and students.  
It leverages Redis (via Cortex) for real-time updates and MongoDB (via Mongoose) for persistence.  
Role-based authorization ensures only **superadmin** or **school_admin** can perform certain operations.

## Features
- **JWT Authentication & Role-Based Authorization** (superadmin, school_admin, student)
- **CRUD Endpoints** for Users, Schools, Classrooms, and Students
- **Real-Time Updates** via Redis + Cortex
- **MongoDB** Integration with Mongoose
- **Configurable** via `.env` file

---

## Requirements
- **Node.js** v14+ (recommended)
- **MongoDB** (local or remote, e.g., MongoDB Atlas)
- **Redis** (local or cloud-based)
- **Valid environment variables** (see `.env` sample below)

---

## Installation (Local Development)

1. **Clone this repo**:
   ```bash
   git clone https://github.com/mscloudtechio/task.git
   cd task
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   1. Copy the example environment file:
      ```bash
      cp .env.example .env
      ```
   2. Edit `.env` to match your local setup. For example:
      ```bash
      # General Service Configuration
      SERVICE_NAME=SCHOOL
      ENV=development

      # Ports
      USER_PORT=5111
      ADMIN_PORT=5222
      ADMIN_URL=http://localhost:5222

      # Redis Configuration
      REDIS_URI=redis://127.0.0.1:6379
      CORTEX_REDIS=redis://127.0.0.1:6379
      CORTEX_PREFIX=none
      CORTEX_TYPE=SCHOOL
      OYSTER_REDIS=redis://127.0.0.1:6379
      OYSTER_PREFIX=none
      CACHE_REDIS=redis://127.0.0.1:6379
      CACHE_PREFIX=SCHOOL:ch

      # MongoDB Configuration
      MONGO_URI=mongodb://localhost:27017/SCHOOL

      # Secrets
      LONG_TOKEN_SECRET=a3f27e980bbf9f5435d50bc5abf7c9d173f3b7b01b1a6dc4389ad93eb4923456
      SHORT_TOKEN_SECRET=17d69b358ff3a3b2dc56f87bc238ab07e07fa2c136c5b9247fd716bc02c15d91
      NACL_SECRET=5a6bc948ea1d4f5382b3db1c29418cbcf8a6e827fed3475093af68ad5c0732aa
      ```

      > **Note**: Keep your secrets **private**. Do **not** commit `.env` to version control.

4. **Run the server locally**:
   ```bash
   npm start
   ```
   The server will start on the port(s) specified in your `.env`.  
   - For example, `USER_PORT=5111` might mean you can access the API at `http://localhost:5111`.

---

## Using MongoDB Atlas (Free Tier)

If you don’t have a local MongoDB server or want a production-ready cloud database, you can use **MongoDB Atlas**:

1. **Create an Account** at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Build a Free Cluster** (Shared Tier).  
   - Pick a region near you.
   - Name your cluster (e.g., `Cluster0`).
3. **Create a Database User** with a secure username/password.
4. **Network Access**:  
   - Whitelist IP addresses (0.0.0.0/0 if you want broad access during development).
5. **Get Connection String**:  
   - In the Atlas UI, click *Connect* → *Connect your application*.
   - Copy the URI, which typically looks like:
     ```bash
     mongodb+srv://myUser:myPassword@cluster0.xyz.mongodb.net/SCHOOL?retryWrites=true&w=majority
     ```
6. **Update `.env`** with your Atlas URI:
   ```bash
   MONGO_URI=mongodb+srv://myUser:myPassword@cluster0.xyz.mongodb.net/SCHOOL
   ```
7. **Rerun** your server. It will connect to MongoDB Atlas instead of a local database.

---

## CD Pipeline to Heroku

We use a **GitHub Actions** pipeline for automated deployments to Heroku whenever code is pushed to `main`.  
The pipeline is located in [`.github/workflows/heroku-deploy.yml`](.github/workflows/heroku-deploy.yml). 

### Adding Secrets to GitHub

In order for the pipeline to set up your Heroku environment correctly, you need to store **real** connection strings and secrets in your **GitHub repository’s Encrypted Secrets**. For example:

1. Go to your GitHub repo’s **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret**.
3. Add each of the following (or whatever your project requires), for example:
   - **HEROKU_API_KEY**: Your Heroku API key (find it under your Heroku account).
   - **HEROKU_APP_NAME**: The name of your Heroku app (e.g. `my-school-api`).
   - **MONGO_URI**: The MongoDB Atlas URI you copied (e.g., `mongodb+srv://myUser:myPass@cluster0.xyz.mongodb.net/SCHOOL`).
   - **REDIS_URI**, **CORTEX_REDIS**, **CORTEX_PREFIX**, ... etc., for your Redis or caching system if they differ from local values.
   - **LONG_TOKEN_SECRET**, **SHORT_TOKEN_SECRET**, **NACL_SECRET**: The secrets used by your application for token signing or encryption.

4. The pipeline uses these secrets to configure your Heroku app’s environment variables automatically.

No manual Heroku deployment steps are needed in this README because the pipeline takes care of it, but ensure the **secrets** in GitHub match what your application expects.

---

## Contributing
Feel free to open issues, suggest improvements, or submit pull requests.

## License
Choose your preferred license (e.g., MIT, Apache, etc.).  
MIT License - see the [LICENSE](LICENSE) file for details.
