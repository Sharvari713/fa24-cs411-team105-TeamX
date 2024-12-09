import mysql.connector
from db_config import DB_CONFIG

def test_db_connection():
    try:
        # Establishing the connection
        connection = mysql.connector.connect(
            host=DB_CONFIG['MYSQL_HOST'],
            user=DB_CONFIG['MYSQL_USER'],
            password=DB_CONFIG['MYSQL_PASSWORD'],
            database=DB_CONFIG['MYSQL_DATABASE']
        )
        
        # Checking if the connection is successful
        if connection.is_connected():
            print("Connection to GCP MySQL was successful!")
            
            # Fetching MySQL Server details
            db_info = connection.get_server_info()
            print("Connected to MySQL Server version:", db_info)
            
            # Checking available databases
            cursor = connection.cursor()
            cursor.execute("SHOW TABLES;")
            tables = cursor.fetchall()
            print("Available tables in the database:")
            for table in tables:
                print(f"- {table[0]}")
            
            cursor.close()
        else:
            print("Failed to connect to the database.")
        
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if 'connection' in locals() and connection.is_connected():
            connection.close()
            print("MySQL connection closed.")

if __name__ == "__main__":
    test_db_connection()
