Create
===========================================

This API is used to create Speed Dating event. Admin/Users provide with Event Details in JSON format.

API - HTTP Method
#################

.. code-block:: python

        POST


API - URL Endpoint
##################
http://localhost/api/createevent

Headers
#######
+-------------+------------------+
| Header      | Value            |
+=============+==================+
| Content-Type| application/json |
+-------------+------------------+

Parameters
##########
+-------------+------------+----------------------------------------------+
| Attribute   | Type       | Description                                  |
+=============+============+==============================================+
| Id          | String     | Event Identifier - Unique                    |
+-------------+------------+----------------------------------------------+
| Name        | String     | Event Name (no special chars)                |
+-------------+------------+----------------------------------------------+
| Display     | String     | Display Name of event                        |
+-------------+------------+----------------------------------------------+
| MaleCount   | String     | No of male participants                      |
+-------------+------------+----------------------------------------------+
| FemaleCount | String     | No of female participants                    |
+-------------+------------+----------------------------------------------+
| OtherCount  | String     | LGBTN participants                           |
+-------------+------------+----------------------------------------------+
| EventDate   | String     | Event Date in Native format                  |
+-------------+------------+----------------------------------------------+
| EventTime   | String     | Event Time HH::MM::ss                        |
+-------------+------------+----------------------------------------------+
| Duration    | String     | Event Name (no special chars)                |
+-------------+------------+----------------------------------------------+
| Image       | String     | Event Name (no special chars)                |
+-------------+------------+----------------------------------------------+
| Status      | String     | Event Status : Started, Yet To start, Closed |
+-------------+------------+----------------------------------------------+

Request
#######
.. code-block:: json

  {
    "Id": "2",
    "Name": "Beach party meet 2017",
    "Display": "Gala meet for Brisbane 2017",
    "MaleCount": "10",
    "FemaleCount": "10",
    "OtherCount": "0",
    "EventDate": "1/3/2017",
    "EventTime": "14:00:00",
    "Duration": "15",
    "Image": "new pic",
    "Status": "Active"
  }

Response
##########
  .. code-block:: json

    {
      "_id": "58b3e04086d7a05433000002",
      "Id": "1",
      "Name": "Gala meet 2017",
      "Display": "Gala meet for Canberra 2017",
      "MaleCount": "10",
      "FemaleCount": "10",
      "OtherCount": "0",
      "EventDate": "1/3/2017",
      "EventTime": "14:00:00",
      "Duration": "4",
      "Image": "new pic",
      "Status": "Active",
      "__v": 0
    }
