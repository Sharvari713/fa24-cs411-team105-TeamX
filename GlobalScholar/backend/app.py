from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import mysql.connector
from db_config import DB_CONFIG


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
  # This will allow cross-origin requests from any origin

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = app.response_class()
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response


# Connect to MySQL database
def get_db_connection():
    return mysql.connector.connect(
        host=DB_CONFIG['MYSQL_HOST'],
        user=DB_CONFIG['MYSQL_USER'],
        password=DB_CONFIG['MYSQL_PASSWORD'],
        database=DB_CONFIG['MYSQL_DATABASE']
    )
# Route to fetch university names
@app.route('/universities', methods=['GET'])
def get_university_names():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = "SELECT UniversityName FROM University"
        cursor.execute(query)
        universities = cursor.fetchall()

        # Extract university names from the result
        university_names = [univ[0] for univ in universities]

        return jsonify(university_names), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
@app.route('/register', methods=['POST'])
def register_user():
    data = request.json
    first_name = data.get('FirstName')
    last_name = data.get('LastName')
    email_id = data.get('EmailId')  
    password = data.get('Password')
    tuition_fee_budget = data.get('TuitionFeeBudget', 0)
    accommodation_budget = data.get('AccommodationBudget', 0)
    selected_colleges = data.get('SelectedColleges', [])

    # Application-level validation
    # Check required fields
    if not all([email_id, password, first_name]):
        return jsonify({'error': 'Email, password, and first name are required!'}), 400

    # Validate budgets
    if not (200 <= accommodation_budget <= 22000):
        return jsonify({'error': 'Accommodation budget must be between 200 and 22000!'}), 400

    if not (0 <= tuition_fee_budget <= 60000):
        return jsonify({'error': 'Tuition fee budget must be between 0 and 60000!'}), 400

    # Ensure selected colleges exist in the database
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch valid university names
        cursor.execute("SELECT UniversityName FROM University")
        valid_universities = {row[0] for row in cursor.fetchall()}

        # Check if all selected colleges are valid
        invalid_colleges = [college for college in selected_colleges if college not in valid_universities]
        if invalid_colleges:
            return jsonify({'error': f'Invalid universities selected: {invalid_colleges}'}), 400

        # Check if user already exists
        cursor.execute("SELECT * FROM User WHERE EmailId = %s", (email_id,))
        if cursor.fetchone():
            return jsonify({'error': 'User already exists!'}), 409

        # Insert new user into the User table
        user_query = """
            INSERT INTO User (FirstName, LastName, EmailId, Password, TuitionFeeBudget, AccommodationBudget)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(user_query, (first_name, last_name, email_id, password, tuition_fee_budget, accommodation_budget))
        user_id = cursor.lastrowid

        # Insert selected universities into User_UnivShortlist table
        univ_query = "INSERT INTO User_UnivShortlist (UserId, UniversityName) VALUES (%s, %s)"
        for college in selected_colleges:
            cursor.execute(univ_query, (user_id, college))

        conn.commit()
        return jsonify({'message': 'User registered successfully!'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
# Route for User Login
@app.route('/login', methods=['POST'])
def login_user():
    data = request.json
    email_id = data.get('EmailId')
    password = data.get('Password')

    if not all([email_id, password]):
        return jsonify({'error': 'Email and password are required!'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check user credentials (without hashing)
        query = "SELECT Id, FirstName, LastName, EmailId, Password FROM User WHERE EmailId = %s AND Password = %s"
        cursor.execute(query, (email_id, password))
        user = cursor.fetchone()

        if user:
            return jsonify({'message': 'Login successful!', 'user': user}), 200
        else:
            return jsonify({'error': 'Invalid email or password!'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Route for getting user info 
@app.route('/userInfo/<int:id>', methods=['GET'])
def get_user_info(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch user details
        user_query = """
            SELECT FirstName, LastName, EmailId, TuitionFeeBudget, AccommodationBudget
            FROM User
            WHERE Id = %s
        """
        cursor.execute(user_query, (id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': 'User not found!'}), 404

        # Fetch universities selected by the user
        univ_query = """
            SELECT UniversityName
            FROM User_UnivShortlist
            WHERE UserId = %s
        """
        cursor.execute(univ_query, (id,))
        universities = [row[0] for row in cursor.fetchall()]

        # Construct user info response
        user_info = {
            'FirstName': user[0],
            'LastName': user[1],
            'EmailId': user[2],
            'TuitionFeeBudget': user[3],
            'AccommodationBudget': user[4],
            'SelectedUniversities': universities
        }

        return jsonify(user_info), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/addUniversity', methods=['POST'])
def add_university():
    data = request.json
    user_id = data.get('userId')
    university_name = data.get('universityName')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the university is already in the user's shortlist
        check_query = "SELECT * FROM User_UnivShortlist WHERE UserId = %s AND UniversityName = %s"
        cursor.execute(check_query, (user_id, university_name))
        if cursor.fetchone():
            return jsonify({'error': 'University already in shortlist'}), 400

        # Add the university to the user's shortlist
        insert_query = "INSERT INTO User_UnivShortlist (UserId, UniversityName) VALUES (%s, %s)"
        cursor.execute(insert_query, (user_id, university_name))
        conn.commit()

        return jsonify({'message': 'University added successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/updateUniversity', methods=['POST'])
def update_universities():
    data = request.json
    user_id = data.get('userId')
    old = data.get('oldUniversity')
    new = data.get('updatedUniversity')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Update the university name in User_UnivShortlist
        update_query = """
            UPDATE User_UnivShortlist
            SET UniversityName = %s
            WHERE UserId = %s AND UniversityName = %s
        """
        cursor.execute(update_query, (new, user_id, old))

        # Check if the update affected any rows
        if cursor.rowcount == 0:
            return jsonify({'error': 'No matching university found for the update.'}), 404

        conn.commit()
        return jsonify({'message': 'University updated successfully!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/removeUniversity', methods=['POST'])
def delete_universities():
    data = request.json
    user_id = data.get('userId')
    UnivDelete = data.get('university')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Delete specified universities from User_UnivShortlist
        delete_query = """
            DELETE FROM User_UnivShortlist 
            WHERE UserId = %s AND UniversityName = %s
        """
        cursor.execute(delete_query, (user_id, UnivDelete))

        conn.commit()
        return jsonify({'message': 'Selected universities deleted successfully!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/getUniversityDetails/<int:Id>', methods=['GET'])
def get_university_details(Id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Use callproc instead of execute for stored procedures
        cursor.callproc('GetUniversityDetails', [Id])
        
        # Fetch results from the first result set
        results = next(cursor.stored_results())
        universities_details = results.fetchall()
        return jsonify(universities_details), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/matching-universities/<int:user_id>', methods=['GET'])
def get_matching_universities(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Execute the stored procedure using raw SQL
        cursor.execute("CALL GetMatchingUniversities(%s)", (user_id,))

        # Fetch all results
        matching_universities = cursor.fetchall()

        return jsonify(matching_universities), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/matching-universities/search/<int:user_id>/<string:key_word>', methods=['GET'])
def search_matching_universities(user_id, key_word):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Execute the stored procedure to fetch universities matching the user budget and search keyword
        cursor.execute("CALL SearchMatchingUniversities(%s, %s)", (user_id, key_word))

        # Fetch all results
        matching_universities = cursor.fetchall()

        return jsonify(matching_universities), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route('/getUserLivingCosts/<int:user_id>', methods=['GET'])
def get_user_living_costs(user_id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Raw SQL query to execute the stored procedure
        query = """
            CALL GetUserLivingCosts(%s)
        """
        cursor.execute(query, (user_id,))

        # Fetch results from the stored procedure
        living_costs = cursor.fetchall()

        return jsonify(living_costs), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/university-details', methods=['GET'])
def get_university_details_admin():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT 
                u.UniversityName, 
                u.State,
                tf.InStateTuitionFees,
                tf.OutOfStateTuitionFees,
                a.RoomAndBoardCost
            FROM 
                University u
            LEFT JOIN 
                TuitionFees tf ON u.UniversityName = tf.UniversityName
            LEFT JOIN 
                Accommodation a ON u.UniversityName = a.UniversityName
        """
        cursor.execute(query)
        results = cursor.fetchall()

        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/user-logs', methods=['GET'])
def get_user_logs():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Query to fetch logs for the specified user
        query = """
            SELECT * FROM UserAudit ORDER BY Timestamp DESC
        """
        cursor.execute(query)
        logs = cursor.fetchall()

        return jsonify(logs), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()



@app.route('/top-diverse-universities', methods=['GET'])
def get_top_diverse_universities():
    race_category = request.args.get('raceCategory')
    top_n = request.args.get('topN', default=10, type=int)

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Using execute insteadF of callproc
        query = f"CALL GetTopDiverseUniversities(%s, %s)"
        cursor.execute(query, (race_category, top_n))
        
        universities = cursor.fetchall()
        print(f"Fetched {len(universities)} universities")

        return jsonify(universities), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/race-categories', methods=['GET'])
def get_race_categories():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = "SELECT DISTINCT RaceCategory FROM Diversity ORDER BY RaceCategory"
        cursor.execute(query)
        
        categories = [row[0] for row in cursor.fetchall()]
        return jsonify(categories), 200
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/get_states_data', methods=['GET'])
def get_states_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                SWE.State,
                SWE.HousingCost,
                SWE.FoodCost,
                SWE.TransportationCost,
                SWE.HealthcareCost,
                COUNT(U.UniversityName) as TotalUniversities
            FROM StateWiseExpense SWE
            LEFT JOIN University U ON SWE.State = U.State
            GROUP BY SWE.State, SWE.HousingCost, SWE.FoodCost, SWE.TransportationCost, SWE.HealthcareCost
        """
        
        cursor.execute(query)
        result = cursor.fetchall()
        return jsonify(result), 200

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/get_state_details/<state>', methods=['GET'])
def get_state_details(state):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                SWE.State,
                SWE.HousingCost,
                SWE.FoodCost,
                SWE.TransportationCost,
                SWE.HealthcareCost,
                U.UniversityName
            FROM StateWiseExpense SWE
            LEFT JOIN University U ON SWE.State = U.State
            WHERE SWE.State = %s
        """
        
        cursor.execute(query, (state,))
        result = cursor.fetchall()
        
        return jsonify(result), 200

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()



@app.route('/transaction-result', methods=['GET'])
def get_transaction_result():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Set the isolation level for the transaction
        cursor.execute("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;")

        # Start a transaction
        cursor.execute("START TRANSACTION;")

        # First query: Fetch users with tuition budgets below the average in-state tuition fees
        query1 = """
            SELECT U.FirstName, U.LastName, U.TuitionFeeBudget, 
                   (SELECT AVG(InStateTuitionFees) FROM TuitionFees) AS avg_state_tuition
            FROM User U
            JOIN User_UnivShortlist US ON U.Id = US.UserId
            JOIN TuitionFees T ON US.UniversityName = T.UniversityName
            WHERE U.TuitionFeeBudget < (SELECT AVG(InStateTuitionFees) FROM TuitionFees);
        """
        cursor.execute(query1)
        result1 = cursor.fetchall()

        # Commit the transaction
        cursor.execute("COMMIT;")

        return jsonify({'result': result1, 'message': 'Transaction executed successfully!'}), 200

    except Exception as e:
        # Rollback the transaction in case of an error
        if conn:
            cursor.execute("ROLLBACK;")
        return jsonify({'error': str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()




# @app.route('/Lowerbudgettran', methods=['GET'])
# def get_transaction_result():
#     conn = None
#     cursor = None
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor(dictionary=True)

#         # Start a transaction
#         cursor.execute("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ")
#         conn.start_transaction()
#         # cursor.execute("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ")

#         # First query: Fetch users with tuition budgets below the average in-state tuition fees
#         query1 = """
#             SELECT U.FirstName, U.LastName, U.TuitionFeeBudget, 
#                    (SELECT AVG(InStateTuitionFees) FROM TuitionFees) AS avg_state_tuition
#             FROM User U
#             JOIN User_UnivShortlist US ON U.Id = US.UserId
#             JOIN TuitionFees T ON US.UniversityName = T.UniversityName
#             WHERE U.TuitionFeeBudget < (SELECT AVG(InStateTuitionFees) FROM TuitionFees);
#         """
#         cursor.execute(query1)
#         result1 = cursor.fetchall()

#         # Commit the transaction
#         conn.commit()

#         return jsonify({'result': result1, 'message': 'Transaction executed successfully!'}), 200

#     except Exception as e:
#         # Rollback the transaction in case of an error
#         if conn:
#             conn.rollback()
#         return jsonify({'error': str(e)}), 500

#     finally:
#         if cursor:
#             cursor.close()
#         if conn:
#             conn.close()

@app.route('/states', methods=['GET'])
def get_states():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "SELECT DISTINCT State FROM University ORDER BY State"
        cursor.execute(query)
        
        states = [row[0] for row in cursor.fetchall()]
        return jsonify(states), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/recommend_universities', methods=['POST'])
def recommend_universities():
    user_id = request.json.get('userId')
    preferred_state = request.json.get('preferredState')
    diversity_importance = request.json.get('diversityImportance')  # 0 to 1

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        cursor.execute("START TRANSACTION")

        cursor.execute("""
            SELECT TuitionFeeBudget, AccommodationBudget
            FROM User
            WHERE Id = %s
        """, (user_id,))
        user_budget = cursor.fetchone()

        cursor.execute("""
            SELECT 
                UC.UniversityName,
                UC.State,
                UC.TotalCost,
                UC.DiversityScore,
                ROUND((UC.StateMatch * 0.3 + 
                 (1 - (UC.TotalCost / %s)) * 0.4 + 
                 (UC.DiversityScore * %s) * 0.3),2) AS MatchScore
            FROM (
                SELECT 
                    U.UniversityName,
                    U.State,
                    TF.OutOfStateTuitionFees + A.RoomAndBoardCost AS TotalCost,
                    (SELECT ROUND(ABS(1 - SUM(POWER(RaceWiseEnrollment / TotalEnrollment, 2))),2)
                    FROM Diversity D
                    WHERE D.UniversityName = U.UniversityName
                    GROUP BY D.UniversityName) AS DiversityScore,
                    CASE WHEN U.State = %s THEN 1 ELSE 0 END AS StateMatch
                FROM University U
                JOIN TuitionFees TF ON U.UniversityName = TF.UniversityName
                JOIN Accommodation A ON U.UniversityName = A.UniversityName
            ) AS UC
            WHERE UC.TotalCost <= %s
            ORDER BY MatchScore DESC
            LIMIT 10
        """, (user_budget['TuitionFeeBudget'] + user_budget['AccommodationBudget'],
              diversity_importance, preferred_state, 
              user_budget['TuitionFeeBudget'] + user_budget['AccommodationBudget']))
        
        recommendations = cursor.fetchall()

        cursor.execute("COMMIT")
        return jsonify(recommendations), 200

    except Exception as e:
        cursor.execute("ROLLBACK")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
