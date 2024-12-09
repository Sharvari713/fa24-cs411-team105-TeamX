from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, text

app = Flask(__name__)
CORS(app)

# Configure GCP SQL connection
db_config = {
    'username': 'YOUR_USERNAME',
    'password': 'YOUR_PASSWORD',
    'db_name': 'YOUR_DB_NAME',
    'host': 'YOUR_GCP_INSTANCE_IP'  # GCP Public IP of the SQL instance
}
engine = create_engine(
    f'mysql+pymysql://{db_config["username"]}:{db_config["password"]}@{db_config["host"]}/{db_config["db_name"]}'
)

# Endpoint to register user
@app.route('/register', methods=['POST'])
def register_user():
    try:
        data = request.json
        user_query = """
            INSERT INTO User (Id, FirstName, LastName, EmailId, Password, TuitionFeeBudget, AccommodationBudget)
            VALUES (:id, :first_name, :last_name, :email, :password, :tuition_budget, :accommodation_budget)
        """
        shortlist_query = """
            INSERT INTO User_UnivShortlist (UserId, UniversityName)
            VALUES (:user_id, :university_name)
        """

        # Insert User details
        with engine.connect() as conn:
            conn.execute(
                text(user_query),
                {
                    'id': data['Id'],
                    'first_name': data['FirstName'],
                    'last_name': data['LastName'],
                    'email': data['EmailId'],
                    'password': data['Password'],
                    'tuition_budget': data['TuitionFeeBudget'],
                    'accommodation_budget': data['AccommodationBudget']
                }
            )

            # Insert shortlisted universities
            for university in data['Universities']:
                conn.execute(
                    text(shortlist_query),
                    {
                        'user_id': data['Id'],
                        'university_name': university
                    }
                )

        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint to fetch query results
@app.route('/results/<int:user_id>', methods=['GET'])
def get_results(user_id):
    try:
        result_query = """
            SELECT U.FirstName, U.LastName, Univ.UniversityName,
            ROUND(AVG(S.HousingCost + S.FoodCost + S.TransportationCost + S.HealthcareCost + A.RoomAndBoardCost), 0) AS TotalLivingCost,
            U.TuitionFeeBudget + U.AccommodationBudget AS TotalBudget
            FROM User U
            JOIN User_UnivShortlist US ON U.Id = US.UserId
            JOIN University Univ ON US.UniversityName = Univ.UniversityName
            JOIN StateWiseExpense S ON Univ.State = S.State
            JOIN Accommodation A ON Univ.UniversityName = A.UniversityName
            WHERE U.Id = :user_id
            AND (S.HousingCost + S.FoodCost + S.TransportationCost + S.HealthcareCost + A.RoomAndBoardCost) <= (U.TuitionFeeBudget + U.AccommodationBudget)
            GROUP BY U.Id, U.FirstName, U.LastName, Univ.UniversityName, S.HousingCost,
            S.FoodCost, S.TransportationCost, S.HealthcareCost, A.RoomAndBoardCost
        """

        with engine.connect() as conn:
            result = conn.execute(text(result_query), {'user_id': user_id}).fetchall()

        # Format the results
        formatted_results = [
            {
                "FirstName": row[0],
                "LastName": row[1],
                "UniversityName": row[2],
                "TotalLivingCost": row[3],
                "TotalBudget": row[4]
            }
            for row in result
        ]

        return jsonify(formatted_results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
