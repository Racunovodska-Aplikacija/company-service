# Company Service

Company and Product management service for the RAC application with REST API and gRPC support.

## Database

- **Database Name**: `companyDB`
- **HTTP Port**: 3000
- **gRPC Port**: 50051

## Entities

### Company

- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `companyName` (String, Required)
- `street` (String, Required)
- `streetAdditional` (String, Optional)
- `postalCode` (String, Required)
- `city` (String, Required)
- `iban` (String, Required, 15-34 characters)
- `bic` (String, Required, 8-11 characters)
- `registrationNumber` (String, Required)
- `vatPayer` (Boolean, Default: false)
- `vatId` (String, Optional)
- `additionalInfo` (Text, Optional)
- `documentLocation` (String, Optional)
- `reverseCharge` (Boolean, Default: false)
- `products` (One-to-Many relation to Product)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Product

- `id` (UUID, Primary Key)
- `companyId` (UUID, Foreign Key to Company)
- `name` (String, Required)
- `cost` (Decimal, Required, Min: 0)
- `measuringUnit` (String, Required)
- `ddvPercentage` (Decimal, Required, Min: 0)
- `company` (Many-to-One relation to Company)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

## REST API Endpoints

All endpoints require JWT authentication.

### Company Management (Protected)

#### Get All Companies (with products)

```
GET /companies
```

**Headers:**

```
Authorization: Bearer {jwt-token}
```

**Response:**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "companyName": "My Company Ltd.",
    "street": "Main Street 123",
    "streetAdditional": "Building A",
    "postalCode": "1000",
    "city": "Ljubljana",
    "iban": "SI56020170014356205",
    "bic": "LJBASI2X",
    "registrationNumber": "1234567000",
    "vatPayer": true,
    "vatId": "SI12345678",
    "additionalInfo": "Additional notes",
    "documentLocation": "/documents/company",
    "reverseCharge": false,
    "products": [
      {
        "id": "product-uuid",
        "companyId": "uuid",
        "name": "Product Name",
        "cost": 99.99,
        "measuringUnit": "pcs",
        "ddvPercentage": 22.0,
        "createdAt": "2026-01-05T10:00:00Z",
        "updatedAt": "2026-01-05T10:00:00Z"
      }
    ],
    "createdAt": "2026-01-05T10:00:00Z",
    "updatedAt": "2026-01-05T10:00:00Z"
  }
]
```

#### Get Company by ID (with products)

```
GET /companies/:id
```

#### Create Company

```
POST /companies
```

**Request Body:**

```json
{
  "companyName": "My Company Ltd.",
  "street": "Main Street 123",
  "streetAdditional": "Building A",
  "postalCode": "1000",
  "city": "Ljubljana",
  "iban": "SI56020170014356205",
  "bic": "LJBASI2X",
  "registrationNumber": "1234567000",
  "vatPayer": true,
  "vatId": "SI12345678",
  "additionalInfo": "Additional notes",
  "documentLocation": "/documents/company",
  "reverseCharge": false
}
```

#### Update Company

```
PUT /companies/:id
```

**Request Body:** Same as Create Company

#### Delete Company

```
DELETE /companies/:id
```

#### Search Companies (Cebelca API)

```
GET /companies/search/cebelca?q={query}
```

External API integration for company search.

### Product Management (Protected)

All product endpoints are nested under companies.

#### Get All Products for a Company

```
GET /companies/:companyId/products
```

#### Get Product by ID

```
GET /companies/:companyId/products/:productId
```

#### Create Product

```
POST /companies/:companyId/products
```

**Request Body:**

```json
{
  "name": "Product Name",
  "cost": 99.99,
  "measuringUnit": "pcs",
  "ddvPercentage": 22.0
}
```

#### Update Product

```
PUT /companies/:companyId/products/:productId
```

**Request Body:** Same as Create Product

#### Delete Product

```
DELETE /companies/:companyId/products/:productId
```

### Health Check

```
GET /health
```

## gRPC Services

### CompanyService and ProductService (Port 50051)

Both services run on the same gRPC server.

#### CompanyService

**GetCompany**
Retrieve a single company by ID.

**Proto Definition:**

```protobuf
service CompanyService {
  rpc GetCompany(GetCompanyRequest) returns (GetCompanyResponse);
}

message GetCompanyRequest {
  string id = 1;
}

message GetCompanyResponse {
  string id = 1;
  string userId = 2;
  string companyName = 3;
  string street = 4;
  string streetAdditional = 5;
  string postalCode = 6;
  string city = 7;
  string iban = 8;
  string bic = 9;
  string registrationNumber = 10;
  bool vatPayer = 11;
  string vatId = 12;
  string additionalInfo = 13;
  string documentLocation = 14;
  bool reverseCharge = 15;
  string createdAt = 16;
  string updatedAt = 17;
}
```

#### ProductService

**GetProducts**
Retrieve multiple products by their IDs (bulk operation).

**Proto Definition:**

```protobuf
service ProductService {
  rpc GetProducts(GetProductsRequest) returns (GetProductsResponse);
}

message GetProductsRequest {
  repeated string ids = 1;
}

message GetProductResponse {
  string id = 1;
  string companyId = 2;
  string name = 3;
  string cost = 4;
  string measuringUnit = 5;
  string ddvPercentage = 6;
  string createdAt = 7;
  string updatedAt = 8;
}

message GetProductsResponse {
  repeated GetProductResponse products = 1;
}
```

## Environment Variables

- `PORT` - HTTP server port (default: 3000)
- `GRPC_PORT` - gRPC server port (default: 50051)
- `DB_HOST` - PostgreSQL host (default: localhost)
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_USERNAME` - Database username (default: postgres)
- `DB_PASSWORD` - Database password (default: postgres)
- `DB_DATABASE` - Database name (default: companyDB)
- `JWT_SECRET` - Secret key for JWT signing
- `FRONTEND_ORIGIN` - CORS origin (default: http://localhost:3000)
- `SWAGGER_SERVER_URL` - Swagger server URL
- `NODE_ENV` - Environment (development/production)

## Running Locally

```bash
npm install
npm run dev
```

## Building for Production

```bash
npm run build
npm start
```

## Docker Build

```bash
docker build -t company-service:latest .
```

## Notes

- Products are always loaded with their parent company when fetching companies
- The service automatically creates the `companyDB` database if it doesn't exist
- Migrations are run automatically on startup to create required tables
- Both Company and Product gRPC services run on a single gRPC server (port 50051)
