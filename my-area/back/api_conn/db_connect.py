import sqlite3
import os
import pandas as pd


def get_db_connection():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, 'database', 'database.db')

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def get_active_actions(table_name="areas"):

    conn = get_db_connection()
    reactions_list = []

    try:
        cursor = conn.cursor()

        for i in range(1, 7):
            cursor.execute(f"""
                SELECT reaction_{i}
                FROM {table_name}
                WHERE isActive_{i} = 1
                AND reaction_{i} IS NOT NULL
                AND reaction_{i} != ''
            """)

            results = cursor.fetchall()

            for result in results:
                if result[0] is not None:
                    reactions_list.append(result[0])
                else:

                    break
        return reactions_list

    except Exception as e:
        print(f"Une erreur est survenue lors de la récupération des données: {e}")
        return None

    finally:
        if conn:
            conn.close()

def get_data_from_db(table_name="areas"):
    conn = get_db_connection()
    try:
        query = """
        SELECT * FROM areas
        """

        df = pd.read_sql_query(query, conn)
        df.to_csv('db.csv', index=False)
        return df

    except Exception as e:
        print(f"Une erreur est survenue lors de la récupération des données: {e}")
        return None

    finally:
        if conn:
            conn.close()


#get_active_actions("areas")
get_data_from_db("areas")