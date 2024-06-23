# CSV to JSON convertor API
Kelp - Coding Challenge – Backend Developer

This Node.js application loads CSV data into a PostgreSQL database table, transforming and analyzing demographic data in the process.

## Requirements

- Node.js (version >= 12.0.0)
- PostgreSQL database

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Abutayar/csv-to-json-convertor-api.git
   cd repository-directory
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up Environment Variables:

   Create a `.env` file in the root directory of your project and add the following configurations:

   ```dotenv
   # PostgreSQL Database Configuration
   PGHOST=
   PGDATABASE=
   PGUSER=
   PGPASSWORD=
   ENDPOINT_ID=

   # CSV File Path
   CSV_FILE_PATH=dataset/generated_records-50k.csv

   # Upload Batch Size
   UPLOAD_BATCH_SIZE=1000
   ```

   Replace the placeholders (`PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`) with your PostgreSQL database connection details. Adjust `CSV_FILE_PATH` and `UPLOAD_BATCH_SIZE` as per your specific requirements.

## Scripts

The project includes the following npm scripts for development, testing, and production:

- **Build**: Compile TypeScript files using TypeScript compiler.

  ```bash
  npm run build
  ```

- **Start**: Start the application using Node.js with environment variables from `.env` file.

  ```bash
  npm start
  ```

- **Dev**: Start the application in development mode using Nodemon and TypeScript.

  ```bash
  npm run dev
  ```

- **Lint**: Run ESLint to lint TypeScript files.

  ```bash
  npm run lint
  ```

- **Test**: Run Jest to execute tests.

  ```bash
  npm test
  ```

- **Test Watch**: Run Jest in watch mode to execute tests on file changes.

  ```bash
  npm run test:watch
  ```

### Environment Variables

- `PGHOST`: Hostname or IP address of your PostgreSQL server.
- `PGDATABASE`: Name of the PostgreSQL database you want to connect to.
- `PGUSER`: Username for accessing the PostgreSQL database.
- `PGPASSWORD`: Password associated with the username.
- `ENDPOINT_ID`: Endpoint for PostgreSQL.
- `CSV_FILE_PATH`: Path to the CSV file that you want to load into your application.
- `UPLOAD_BATCH_SIZE`: Number of records to process in each batch.

### Development

- **Testing**: Use `npm test` to run unit tests. Ensure mock data and proper file mocking are set up to prevent file-related errors during testing.

- **Code Structure**: The application separates concerns into modules (`lib/`, `helper/`) for database interaction, stream processing, and utility functions.

