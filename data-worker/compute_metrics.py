import time
import psycopg2
from datetime import datetime
import pandas as pd

def connect_db():
    for i in range(30):
        try:
            conn = psycopg2.connect(
                host="db", 
                dbname="metrics", 
                user="postgres", 
                password="postgres"
            )
            return conn
        except Exception as e:
            print(f"Waiting for DB... ({i+1}/30)")
            time.sleep(2)
    raise Exception("Could not connect to database")

conn = connect_db()
print("Worker connected to database!")

while True:
    try:
        cur = conn.cursor()
        cur.execute("SELECT name, value, when_ts FROM metrics WHERE when_ts > now() - interval '1 hour'")
        rows = cur.fetchall()
        cur.close()
        
        if rows:
            df = pd.DataFrame(rows, columns=['name','value','when_ts'])
            
            print(f"\n{'='*60}")
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Metrics Analysis (Last Hour)")
            print(f"{'='*60}")
            
            # Average by metric type
            agg = df.groupby('name')['value'].agg(['mean', 'min', 'max', 'count'])
            print("\n📊 Metric Summary:")
            print(agg.to_string())
            
            # Top 5 metrics by average value
            top = df.groupby('name')['value'].mean().sort_values(ascending=False).head(5)
            print(f"\n🔝 Top 5 Metrics by Average Value:")
            for name, val in top.items():
                print(f"  • {name}: {val:.2f}")
            
            print(f"\n✅ Total data points: {len(rows)}")
            print(f"{'='*60}\n")
        else:
            print(".", end="", flush=True)
            
        conn.commit()
        time.sleep(30)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        time.sleep(5)
        try:
            conn = connect_db()
        except:
            pass