FROM golang:1.23 AS builder
WORKDIR /app

# Copy everything first
COPY . .

# Initialize module and download dependencies
RUN go mod init metrics-backend || true
RUN go mod tidy
RUN go mod download

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o server main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]