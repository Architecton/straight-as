import mysql.connector
from geopy.distance import geodesic
from flask import Flask, jsonify, request, Response

from Restaurant import Restaurant

app = Flask(__name__)


def get_closest_restaurants_data(lat_lon):

    # In radius 1000 meters.
    radius = 1000

    # Convert input to proper data type.
    ltln = (float(lat_lon['lat']), float(lat_lon['lon']))

    mydb = mysql.connector.connect(
        host='remotemysql.com',
        user='A0x1vtmhhr',
        passwd='ySunKokDkC',
        database='A0x1vtmhhr'
    )

    mycursor = mydb.cursor()

    mycursor.execute("SELECt * FROM restavracije")
    result = mycursor.fetchall()

    restaurants = []

    for r in result:

        r_json = Restaurant(r).toJson()

        if geodesic(ltln, (float(r_json['latitude']), float(r_json['longitude']))).m <= radius:
            restaurants.append(r_json)

    return restaurants

# -------------------------------------------------- #


@app.route('/')
def hello_world():
    return 'API Študentskih restavracij v sloveniji.', 200


@app.route('/restavracije/closest')
def closets_restaurants_data():

    args = request.args
    print(args)
    lat_lon = {'lat': args.getlist('lat')[0], 'lon': args.getlist('lon')[0]}

    return jsonify({'closest_restaurants': get_closest_restaurants_data(lat_lon)}), 200


@app.route('/restavracije')
def get_all_restaurants():
    """
    :return: all restaurants in my DB
    """
    mydb = mysql.connector.connect(
        host='remotemysql.com',
        user='A0x1vtmhhr',
        passwd='ySunKokDkC',
        database='A0x1vtmhhr'
    )

    mycursor = mydb.cursor()

    mycursor.execute("SELECt * FROM restavracije")
    result = mycursor.fetchall()

    restaurants = []

    for r in result:
        restaurants.append(Restaurant(r).toJson())

    mycursor.close()
    mydb.close()

    return jsonify({'restaurants': restaurants}), 200


@app.route('/restavracije/<myid>')
def get_one_restaurant_by_id(myid):
    """
    :param myid: integer id of a restaurant, max 418
    :return: returs one student restaurant with <myid>
    """

    assert myid == request.view_args['myid']

    mydb = mysql.connector.connect(
        host='remotemysql.com',
        user='A0x1vtmhhr',
        passwd='ySunKokDkC',
        database='A0x1vtmhhr'
    )

    mycursor = mydb.cursor()

    sql_formula = ("SELECt * FROM restavracije WHERE restavracije.id = %s")
    mycursor.execute(sql_formula, (myid,))

    result = mycursor.fetchall()

    restaurants = []

    for r in result:
        restaurants.append(Restaurant(r).toJson())

    mycursor.close()
    mydb.close()

    return jsonify({'restaurants': restaurants}), 200


@app.route('/restavracije/name/<mName>')
def get_one_restaurant_by_name(mName):
    """
    :param mName: string name of a restaurant
    :return: returs one student restaurant with name <mName>
    """

    assert mName == request.view_args['mName']

    mydb = mysql.connector.connect(
        host='remotemysql.com',
        user='A0x1vtmhhr',
        passwd='ySunKokDkC',
        database='A0x1vtmhhr'
    )

    mycursor = mydb.cursor()

    mName = mName.upper()

    sql_formula = "SELECt * FROM restavracije WHERE restavracije.name = %s"
    mycursor.execute(sql_formula, (mName,))

    result = mycursor.fetchall()

    restaurants = []

    for r in result:
        restaurants.append(Restaurant(r).toJson())

    mycursor.close()
    mydb.close()

    return jsonify({'restaurants': restaurants}), 200

@app.route('/mesta')
def get_unique_cities():
    """
    :return: a list of all cities that have student restaurants
    """
    mydb = mysql.connector.connect(
        host='remotemysql.com',
        user='A0x1vtmhhr',
        passwd='ySunKokDkC',
        database='A0x1vtmhhr'
    )

    mycursor = mydb.cursor()

    mycursor.execute("SELECT DISTINCT city FROM restavracije")
    result = mycursor.fetchall()

    cities = []

    for r in result:
        cities.append(r[0])

    mycursor.close()
    mydb.close()

    return jsonify({'cities': cities}), 200


@app.route('/restavracije/mesto/<mesto>')
def get_restaurants_of_city(mesto):
    """
    :param mesto: a string representing the name of a city
    :return: all students restaurants in the given city
    """

    assert mesto == request.view_args['mesto']

    mydb = mysql.connector.connect(
        host='remotemysql.com',
        user='A0x1vtmhhr',
        passwd='ySunKokDkC',
        database='A0x1vtmhhr'
    )

    mycursor = mydb.cursor()

    mesto = mesto.upper()

    sql_formula = "SELECT * FROM restavracije WHERE restavracije.city = %s"
    mycursor.execute(sql_formula, (mesto,))

    result = mycursor.fetchall()

    restaurants = []

    for r in result:
        restaurants.append(Restaurant(r).toJson())

    mycursor.close()
    mydb.close()

    return jsonify({'restaurants': restaurants}), 200


@app.route('/restavracije/mesto/portoros')
@app.route('/restavracije/mesto/PORTOROS')
def get_restaurants_of_portoros():

    """
    There was an issue with the name "PORTOROŽ/PORTOROSE" is the city name
    stored in the DB. The strange city name caused problems with querying
    so I made an extra endpoint.
    :return: all student restaurants in Portoroz
    """

    mydb = mysql.connector.connect(
        host='remotemysql.com',
        user='A0x1vtmhhr',
        passwd='ySunKokDkC',
        database='A0x1vtmhhr'
    )

    mycursor = mydb.cursor()

    mycursor.execute("SELECt * FROM restavracije WHERE restavracije.city = 'PORTOROŽ/PORTOROSE'")
    result = mycursor.fetchall()

    restaurants = []

    for r in result:
        restaurants.append(Restaurant(r).toJson())

    mycursor.close()
    mydb.close()

    return jsonify({'restaurants': restaurants}), 200


@app.route('/restavracije/mesto/koper')
@app.route('/restavracije/mesto/KOPER')
def get_restaurants_of_koper():

    """
    There was an issue with the name "KOPER/CAPODISTRIA" is the city name
    stored in the DB. The strange city name caused problems with querying
    so I made an extra endpoint.
    :return: all student restaurants in Koper
    """

    mydb = mysql.connector.connect(
        host='remotemysql.com',
        user='A0x1vtmhhr',
        passwd='ySunKokDkC',
        database='A0x1vtmhhr'
    )

    mycursor = mydb.cursor()

    mycursor.execute("SELECt * FROM restavracije WHERE restavracije.city = 'KOPER/CAPODISTRIA'")
    result = mycursor.fetchall()

    restaurants = []

    for r in result:
        restaurants.append(Restaurant(r).toJson())

    mycursor.close()
    mydb.close()

    return jsonify({'restaurants': restaurants}), 200


@app.route('/restavracije/mesto/izola')
@app.route('/restavracije/mesto/IZOLA')
def get_restaurants_of_izola():

    """
    There was an issue with the name "IZOLA/ISOLA" is the city name
    stored in the DB. The strange city name caused problems with querying
    so I made an extra endpoint.
    :return: all student restaurants in Izola
    """

    mydb = mysql.connector.connect(
        host='remotemysql.com',
        user='A0x1vtmhhr',
        passwd='ySunKokDkC',
        database='A0x1vtmhhr'
    )

    mycursor = mydb.cursor()

    mycursor.execute("SELECt * FROM restavracije WHERE restavracije.city = 'IZOLA/ISOLA'")
    result = mycursor.fetchall()

    restaurants = []

    for r in result:
        restaurants.append(Restaurant(r).toJson())

    mycursor.close()
    mydb.close()

    return jsonify({'restaurants': restaurants}), 200

# -------------------------------------------------- #


def main():
    app.run()


if __name__ == '__main__':
    main()

