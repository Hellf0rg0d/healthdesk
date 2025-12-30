# HealthDesk

HealthDesk is a comprehensive backend solution for a modern healthcare platform. It provides a wide range of features to facilitate communication and data management between patients, doctors, and pharmacies.

## Features

*   **User Authentication:** Secure, token-based authentication for patients, doctors, and pharmacists.
*   **Patient Management:** Manage patient details, including medical history and documents.
*   **Doctor Availability:** Real-time tracking of doctor availability for consultations.
*   **Video Consultations:** WebSocket-based signaling for video calls between patients and doctors.
*   **AI-Powered Summarization:** Integration with Google GenAI to summarize consultation transcripts.
*   **Pharmacy & Inventory Management:** Manage pharmacy information and medicine inventory.
*   **Document Management:** Upload and retrieve patient-related documents.
*   **Notifications:** A notification system to alert users.

## Technologies Used

*   **Backend:** Spring Boot 3
*   **Database:** MySQL
*   **Caching:** Redis
*   **Authentication:** JSON Web Tokens (JWT)
*   **API:** RESTful APIs & WebSocket
*   **AI:** Google GenAI
*   **Build Tool:** Maven

## Prerequisites

Before you begin, ensure you have the following installed:

*   Java 21 or later
*   Maven 3.6 or later
*   MySQL Server
*   Redis Server

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd healthdesk
```

### 2. Configure the Application

Open `src/main/resources/application.properties` and update the following properties with your local environment details:

*   **Database Configuration:**
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name
    spring.datasource.username=your_mysql_username
    spring.datasource.password=your_mysql_password
    ```

*   **Redis Configuration:**
    ```properties
    spring.redis.host=localhost
    spring.redis.port=6379
    ```

*   **JWT Secret:**
    ```properties
    jwt.secret=your_jwt_secret
    ```

*   **Google GenAI API Key:**
    ```properties
    genai.api.key=your_genai_api_key
    ```

### 3. Build and Run the Application

You can build and run the application using Maven:

```bash
mvn spring-boot:run
```

The application will start on the default port `8080`.

## API Documentation

The API is organized into several resources. The base URL for all endpoints is `/healthdesk`.

### Authentication (`/auth`)

| Method | Endpoint           | Description                                                            |
|:-------|:-------------------|:-----------------------------------------------------------------------|
| `GET`  | `/check/password`  | Checks if the provided password is correct for a given email and role. |
| `POST` | `/create/patient`  | Creates a new patient user.                                            |
| `GET`  | `/check/phone`     | Checks if a phone number is already registered.                        |
| `GET`  | `/check/email`     | Checks if an email is already registered for a given role.             |
| `GET`  | `/send/email`      | Sends an OTP to the provided email address.                            |
| `GET`  | `/check/otp/email` | Checks if the provided OTP is correct for the given email.             |
| `GET`  | `/version`         | Returns the API version.                                               |

### Data (`/send/data` & `/read/data`)

| Method  | Endpoint                                                          | Description                                                             |
|:--------|:------------------------------------------------------------------|:------------------------------------------------------------------------|
| `POST`  | `/send/data/set-doctor-availability`                              | Sets the doctor's availability status.                                  |
| `PATCH` | `/send/data/update-doctor-availability`                           | Extends the TTL of the doctor's availability.                           |
| `POST`  | `/send/data/unset-doctor-availability`                            | Removes the doctor's availability status.                               |
| `GET`   | `/read/data/doctor-name`                                          | Retrieves the doctor's name for a given email.                          |
| `GET`   | `/read/data/patient-phone`                                        | Retrieves the patient's phone number for a given email.                 |
| `GET`   | `/read/data/patient-name`                                         | Retrieves the patient's name for a given email.                         |
| `GET`   | `/read/data/get-doctor-availability`                              | Checks if a doctor is available.                                        |
| `POST`  | `/send/data/patient-details`                                      | Adds details for a new patient.                                         |
| `POST`  | `/send/data/add-details-to-patient-video`                         | Adds details to a patient's video consultation record.                  |
| `POST`  | `/send/data/add-details-provided-by-doctor-for-the-patient-video` | Adds details provided by the doctor for a patient's video consultation. |
| `POST`  | `/send/data/conversation`                                         | Uploads an audio file of a conversation to be summarized.               |

### Documents (`/documents`)

| Method | Endpoint   | Description                                      |
|:-------|:-----------|:-------------------------------------------------|
| `POST` | `/upload`  | Uploads a document for a patient.                |
| `GET`  | `/{phone}` | Retrieves a list of all documents for a patient. |

### Pharmacy (`/pharmacies`)

| Method | Endpoint   | Description                         |
|:-------|:-----------|:------------------------------------|
| `POST` | `/add`     | Adds a new pharmacy.                |
| `GET`  | `/getAll`  | Retrieves a list of all pharmacies. |
| `GET`  | `/id/{id}` | Retrieves a pharmacy by its ID.     |
| `GET`  | `/search`  | Searches for pharmacies by name.    |

### Medicine (`/medicines`)

| Method   | Endpoint       | Description                                     |
|:---------|:---------------|:------------------------------------------------|
| `GET`    | `/getAll`      | Retrieves a list of all medicines.              |
| `POST`   | `/add`         | Adds a new medicine.                            |
| `GET`    | `/getAll/{id}` | Retrieves a medicine by its ID.                 |
| `PUT`    | `/{id}`        | Updates an existing medicine.                   |
| `DELETE` | `/{id}`        | Deletes a medicine by its ID.                   |
| `GET`    | `/search`      | Searches for medicines by name or generic name. |

### Inventory (`/inventory`)

| Method | Endpoint                 | Description                                                            |
|:-------|:-------------------------|:-----------------------------------------------------------------------|
| `POST` | `/alterStock`            | Adds or updates the stock of a medicine in a pharmacy's inventory.     |
| `GET`  | `/pharmacy/{email}`      | Retrieves the inventory for a specific pharmacy.                       |
| `GET`  | `/medicine/{medicineId}` | Retrieves the inventory for a specific medicine across all pharmacies. |
| `GET`  | `/medicine`              | Retrieves the inventory for a specific medicine by name.               |
| `GET`  | `/pharmacy`              | Retrieves the inventory for a specific pharmacy by name.               |
| `GET`  | `/nearest`               | Finds the nearest pharmacies that have a specific medicine in stock.   |

### Video Call (WebSocket)

| Endpoint                       | Description                                                                             |
|:-------------------------------|:----------------------------------------------------------------------------------------|
| `/healthdesk/videocall/create` | Initiates a video call. Sends a message to the doctor's queue with the meeting details. |

### Logs (`/logs`)

| Method | Endpoint | Description                             |
|:-------|:---------|:----------------------------------------|
| `GET`  | `/`      | Retrieves a list of log entries (HTML). |
