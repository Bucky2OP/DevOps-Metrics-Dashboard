package main

import (
	"database/sql"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

type Metric struct {
	ID    int       `json:"id"`
	Name  string    `json:"name"`
	Value float64   `json:"value"`
	When  time.Time `json:"when"`
}

var metricTypes = []string{
	"api.response_time",
	"cpu.usage",
	"memory.usage",
	"disk.io",
	"network.bandwidth",
	"error.rate",
	"request.count",
	"db.query_time",
	// DORA Metrics
	"deployment.frequency",
	"lead.time.minutes",
	"change.failure.rate",
	"mttr.minutes",
	// DevOps Pipeline Metrics
	"build.success.rate",
	"build.duration.seconds",
	"test.coverage.percent",
	"code.churn.lines",
}

func main() {
	rand.Seed(time.Now().UnixNano())
	
	r := gin.Default()
	r.Use(cors.Default())
	
	db, err := sql.Open("postgres", "postgres://postgres:postgres@db:5432/metrics?sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Wait for DB
	for i := 0; i < 30; i++ {
		if err := db.Ping(); err == nil {
			break
		}
		time.Sleep(time.Second)
	}

	_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS metrics (
		id SERIAL PRIMARY KEY, 
		name TEXT, 
		value FLOAT, 
		when_ts TIMESTAMP DEFAULT NOW()
	)`)

	// Insert initial sample data on startup
	log.Println("Inserting initial sample data...")
	for i := 0; i < 20; i++ {
		for _, metricName := range metricTypes {
			var value float64
			switch metricName {
			case "api.response_time":
				value = 50 + rand.Float64()*200
			case "cpu.usage":
				value = 20 + rand.Float64()*60
			case "memory.usage":
				value = 30 + rand.Float64()*50
			case "disk.io":
				value = rand.Float64() * 1000
			case "network.bandwidth":
				value = rand.Float64() * 500
			case "error.rate":
				value = rand.Float64() * 5
			case "request.count":
				value = float64(rand.Intn(1000))
			case "db.query_time":
				value = 10 + rand.Float64()*90
			case "deployment.frequency":
				value = float64(rand.Intn(10) + 1)
			case "lead.time.minutes":
				value = 30 + rand.Float64()*90
			case "change.failure.rate":
				value = rand.Float64() * 20
			case "mttr.minutes":
				value = 10 + rand.Float64()*50
			case "build.success.rate":
				value = 75 + rand.Float64()*25
			case "build.duration.seconds":
				value = 120 + rand.Float64()*480
			case "test.coverage.percent":
				value = 60 + rand.Float64()*40
			case "code.churn.lines":
				value = rand.Float64() * 500
			}
			db.Exec(`INSERT INTO metrics (name,value,when_ts) VALUES ($1,$2,NOW() - interval '1 minute' * $3)`, 
				metricName, value, i)
		}
	}
	log.Println("Initial sample data inserted!")

	r.POST("/metrics", func(c *gin.Context) {
		var m Metric
		if err := c.BindJSON(&m); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"err": err.Error()})
			return
		}
		_, err = db.Exec(`INSERT INTO metrics (name,value,when_ts) VALUES ($1,$2,$3)`, m.Name, m.Value, time.Now())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"err": err.Error()})
			return
		}
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.GET("/metrics", func(c *gin.Context) {
		rows, _ := db.Query(`SELECT id,name,value,when_ts FROM metrics ORDER BY when_ts DESC LIMIT 500`)
		defer rows.Close()
		var out []Metric
		for rows.Next() {
			var m Metric
			_ = rows.Scan(&m.ID, &m.Name, &m.Value, &m.When)
			out = append(out, m)
		}
		c.JSON(200, out)
	})

	// Enhanced demo generator - creates multiple realistic metrics
	r.GET("/emit_demo", func(c *gin.Context) {
		for _, metricName := range metricTypes {
			var value float64
			switch metricName {
			case "api.response_time":
				value = 50 + rand.Float64()*200
			case "cpu.usage":
				value = 20 + rand.Float64()*60
			case "memory.usage":
				value = 30 + rand.Float64()*50
			case "disk.io":
				value = rand.Float64() * 1000
			case "network.bandwidth":
				value = rand.Float64() * 500
			case "error.rate":
				value = rand.Float64() * 5
			case "request.count":
				value = float64(rand.Intn(1000))
			case "db.query_time":
				value = 10 + rand.Float64()*90
			case "deployment.frequency":
				value = float64(rand.Intn(10) + 1) // 1-10 deployments per day
			case "lead.time.minutes":
				value = 30 + rand.Float64()*90 // 30-120 minutes
			case "change.failure.rate":
				value = rand.Float64() * 20 // 0-20%
			case "mttr.minutes":
				value = 10 + rand.Float64()*50 // 10-60 minutes
			case "build.success.rate":
				value = 75 + rand.Float64()*25 // 75-100%
			case "build.duration.seconds":
				value = 120 + rand.Float64()*480 // 2-10 minutes
			case "test.coverage.percent":
				value = 60 + rand.Float64()*40 // 60-100%
			case "code.churn.lines":
				value = rand.Float64() * 500 // 0-500 lines
			}
			_, _ = db.Exec(`INSERT INTO metrics (name,value) VALUES ($1,$2)`, metricName, value)
		}
		c.JSON(200, gin.H{"status": "emitted", "count": len(metricTypes)})
	})

	// Auto-emit endpoint for continuous data generation
	go func() {
		time.Sleep(5 * time.Second)
		for {
			for _, metricName := range metricTypes {
				var value float64
				switch metricName {
				case "api.response_time":
					value = 50 + rand.Float64()*200
				case "cpu.usage":
					value = 20 + rand.Float64()*60
				case "memory.usage":
					value = 30 + rand.Float64()*50
				case "disk.io":
					value = rand.Float64() * 1000
				case "network.bandwidth":
					value = rand.Float64() * 500
				case "error.rate":
					value = rand.Float64() * 5
				case "request.count":
					value = float64(rand.Intn(1000))
				case "db.query_time":
					value = 10 + rand.Float64()*90
				case "deployment.frequency":
					value = float64(rand.Intn(10) + 1)
				case "lead.time.minutes":
					value = 30 + rand.Float64()*90
				case "change.failure.rate":
					value = rand.Float64() * 20
				case "mttr.minutes":
					value = 10 + rand.Float64()*50
				case "build.success.rate":
					value = 75 + rand.Float64()*25
				case "build.duration.seconds":
					value = 120 + rand.Float64()*480
				case "test.coverage.percent":
					value = 60 + rand.Float64()*40
				case "code.churn.lines":
					value = rand.Float64() * 500
				}
				_, _ = db.Exec(`INSERT INTO metrics (name,value) VALUES ($1,$2)`, metricName, value)
			}
			time.Sleep(10 * time.Second)
		}
	}()

	r.Run(":8080")
}