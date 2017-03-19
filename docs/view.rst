View
===========================================

Create
===========================================

This API is used to create Speed Dating event. Admin/Users provide with Event Details in JSON format.

API - HTTP Method
#################

.. code-block:: python

        GET


API - URL Endpoint
##################
http://localhost/api/event/{:id}

Headers
#######
+-------------+------------------+
| Header      | Value            |
+=============+==================+
| Content-Type| application/json |
+-------------+------------------+





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
