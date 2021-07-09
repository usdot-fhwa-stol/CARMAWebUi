/**
 * subscribe to service /guidance/get_available_routes
 */
function subscribeToGuidanceAvailaleRoutes ()
{
    var service = new ROSLIB.Service({
        ros: g_ros,
        name: S_GUIDANCE_AVAILABLE_ROUTES,
        messageType: M_GUIDANCE_AVAILABLE_ROUTES
    });
    $('#divCapabilitiesRoute').html('Awaiting the list of available routes...');
    $('#divCapabilitiesContent').css('display','inline-block');
    // Create a Service Request with no arguments.
    var request = new ROSLIB.ServiceRequest({});

    // Call the service and get back the results in the callback.
    // The result is a ROSLIB.ServiceResponse object.
    try
    {
        service.callService(request, function (result) 
        {
            //Check ROSBridge connection before subscribe a topic
            IsROSBridgeConnected();
            var availableRoutes = result.availableRoutes;
            if(availableRoutes != null && availableRoutes.length > 0)
            {
                $('#route-list-content-no-route-available').html('');           
                $('#divCapabilitiesRoute').html('Please select a route.');           
                availableRoutes.forEach(route=>{
                    // console.log('route name is: ' + route.route_name);
                    // console.log('route Id is: ' + route.route_id);                
                    //display route list info in html <div id='route-list-content'>
                    $('#route-list-content').append(createRouteSelectionRadio(route.route_id,route.route_name));
                });
            }        
        });
    }
    catch(ex)
    {
        console.error("ros_route.js: call rosservice /guidance/get_available_routes failed.")
    }
   finally
   {
         //route is Already selected
        if(session_selectedRoute != null && session_selectedRoute.id != null 
            && session_selectedRoute.id.length != 0 && session_selectedRoute.id !='undefined')
        {
            $('#route-list-content-no-route-available').html('');
            $('#divCapabilitiesRoute').html('Selected route is ' + session_selectedRoute.name );         
            $('#clearRoutes').css('display','none'); 
            $('#route-list-content').append(createRouteSelectionRadio(session_selectedRoute.id,session_selectedRoute.name));   
            //check whether the route is already selected in session
            if(session_selectedRoute != null && session_selectedRoute.id != null 
                && session_selectedRoute.id.length > 0)
            {
                let selectedRouteRadio = document.getElementById('route_radio_'+session_selectedRoute.id);
                if(selectedRouteRadio != null && selectedRouteRadio != 'undefined')
                {
                    selectedRouteRadio.checked = true;
                }
            }          
        }
   }
   
}

/**
 * rostopic pub /guidance/route_state cav_msgs/RouteState "header: {seq: 0, stamp: 1232323,frame_id: '0'}
routeID: 'test route'
state: 0 
cross_track: 0 
lanelet_downtrack: 0 
lanelet_id: 4 
speed_limit: 23"
 */
/**
 * /guidance/route_state
 * The current/Actual speed of the vehicle is in: /guidance/route_state/current_segment/waypoint/speed_limit
 */
function subscribeToGuidanceRouteState()
{
    var listener = new ROSLIB.Topic({
        ros: g_ros,
        name: T_ROUTE_STATE,
        messageType: M_ROUTE_STATE
    });
    listener.subscribe(function(message)
    {
        //Check ROSBridge connection before subscribe a topic
        IsROSBridgeConnected();
        if(message!=null && message.speed_limit != null)
        {
            let speed_limit_converted = Math.floor(Math.abs(message.speed_limit * METER_TO_MPH));
            if( document.getElementById('speed-limit') != null)            {
                
                updateSpeedLimit(speed_limit_converted);
            }
            else
            {
                //Create speed limit if not exist in html
                $('.speed-limit-col').append(updateSpeedLimit(speed_limit_converted));
            }
        }        
    });
}

/*
    Set the route once based on user selection.
*/
function setRoute(id,route_name) 
{
    // Calling setActiveRoute service
    var service = new ROSLIB.Service({
        ros: g_ros,
        name: S_ACTIVATE_ROUTE,
        serviceType: M_ACTIVE_ROUTE
    });

    var selectedRouteid = id.toString();

    // Create a Service Request.
    var request = new ROSLIB.ServiceRequest({
        choice: 0, // choice '0' indicates that a routeID is being provided for this setActiveRoute service request
        routeID: selectedRouteid
    });

    //Selected Route
    var rbRoute = document.getElementById("route_radio_" + id.toString());

    var ErrorStatus = {
        NO_ERROR: { value: 0, text: 'NO_ERROR' },
        NO_ROUTE: { value: 1, text: 'NO_ROUTE' },
        ALREADY_FOLLOWING_ROUTE: { value: 2, text: 'ALREADY_FOLLOWING_ROUTE' },
        ROUTE_FILE_ERROR: { value: 3, text: 'ROUTE_FILE_ERROR' },
        ROUTING_FAILURE: { value: 4, text: 'ROUTING_FAILURE' },
        TRANSFORM_ERROR: { value: 5, text: 'TRANSFORM_ERROR' },
    };
    try
    {
        // Call the service and get back the results in the callback.
        service.callService(request, function (result) 
        {
            let errorDescription = '';
            if (result.errorStatus != ErrorStatus.NO_ERROR.value) 
            {             
                switch (result.errorStatus) 
                {
                    case ErrorStatus.NO_ROUTE.value:
                        errorDescription = ErrorStatus.NO_ROUTE.text;
                        break;
                    case ErrorStatus.ALREADY_FOLLOWING_ROUTE.value:
                        errorDescription = ErrorStatus.ALREADY_FOLLOWING_ROUTE.text;
                        break;
                    case ErrorStatus.ROUTE_FILE_ERROR.value:
                         errorDescription = ErrorStatus.ROUTE_FILE_ERROR.text;
                         break;
                    case ErrorStatus.ROUTING_FAILURE.value:
                         errorDescription = ErrorStatus.ROUTING_FAILURE.text;
                         break;
                    case ErrorStatus.TRANSFORM_ERROR.value:
                         errorDescription = ErrorStatus.TRANSFORM_ERROR.text;
                        break;
                    default: //unexpected value or error
                        errorDescription = result.errorStatus; //print the number;
                        break;
                }

                //Allow user to select it again.
                rbRoute.checked = false;
            }
            else 
            { 
                //Call succeeded
                console.log('call set active route success!');
                //load the selected/active route to session
                session_selectedRoute.id = selectedRouteid;
                session_selectedRoute.name = route_name;
                $('#divCapabilitiesRoute').html('Selected route is ' + route_name );
                $('#divCapabilitiesContent').css('display','inline-block');
                $('#clearRoutes').css('display','none');
                var route_list = document.getElementsByClassName('container_route_radio');
                Array.prototype.forEach.call(route_list, function(ele) {
                    if(ele.id != 'container_route_radio_' +  selectedRouteid)
                    {
                        ele.style.display='none';
                    }
                });                
               
                //Subscribe to active route to map the segments
                showActiveRoute();
            }
            if (errorDescription != '') 
            {
                $('#divCapabilitiesRoute').html('Setting the route failed (' + errorDescription + '). <br/> Please try again or contact your System Administrator.');
                $('#divCapabilitiesContent').css('display','inline-block');
            }
        });
    }
    catch(ex)
    {
        rbRoute.checked = false;
    }

    //Get Route Event
    var listenerRouteEvent = new ROSLIB.Topic({
        ros: g_ros,
        name: T_ROUTE_EVENT,
        messageType: M_ROUTE_EVENT
    });
    listenerRouteEvent.subscribe(function (message) 
    {
        if(message.event == 6)//ROUTE_GEN_FAIL
        {
            let errorMsgByRouteId = document.getElementById('error_msg_'+selectedRouteid);
            if(errorMsgByRouteId!= null && errorMsgByRouteId != 'undefined')
                errorMsgByRouteId.style.display='block'; //show error mesage fo route generation failed
        }
    });
}

/**
 * When restart, the current active route will be aborted and reset route state from Following to Loading
 */
function abortActiveRoute()
{
    let service = new ROSLIB.Service({
        ros: g_ros,
        name: S_ABORT_ACTIVE_ROUTE,
        serviceType: M_ABORT_ACTIVE_ROUTE_REQ
    });

     // Create a Service Request.
    let request = new ROSLIB.ServiceRequest({
    });

    let ErrorStatus ={
        NO_ERROR: { value: 0, text: 'NO_ERROR' },
        NO_ACTIVE_ROUTE: { value: 1, text: 'NO_ACTIVE_ROUTE' }
    }

    try
    {
        // Call the service and get back the results in the callback.
        service.callService(request, function (result) 
        {
            let errorDescription = '';
            if (result.errorStatus != ErrorStatus.NO_ERROR.value) 
            {             
                switch (result.errorStatus) 
                {
                    case ErrorStatus.NO_ACTIVE_ROUTE.value:
                        errorDescription = ErrorStatus.NO_ACTIVE_ROUTE.text;
                        break;                    
                    default: //unexpected value or error
                        errorDescription = result.errorStatus; //print the number;
                        break;
                }
            }
            else 
            { 
                //Call succeeded
                console.log('call abort active route success!');
                if(session_selectedRoute!=null && session_selectedRoute.name!=null && session_selectedRoute.name.length()>0)
                {
                    $('#divCapabilitiesRoute').html('Aborted Route: ' + session_selectedRoute.name );       
                    $('#divCapabilitiesContent').css('display','inline-block');
                }             
            }

            if (errorDescription != '') 
            {
                if(errorDescription == ErrorStatus.NO_ACTIVE_ROUTE.text){
                    $('#divCapabilitiesRoute').html('Called abort active route. Currently, '+errorDescription);
                    $('#divCapabilitiesContent').css('display','inline-block');
                }                
            }
        });
    }
    catch(ex)
    {
        console.log('Calling abort active route failed!');
        $('#divCapabilitiesRoute').html('Calling abort active route failed. <br/> Please try again or contact your System Administrator.');
        $('#divCapabilitiesContent').css('display','inline-block');
    }
}

/* 
    Watch out for route completed, and display the Route State in the System Status tab.
    Route state are only set and can be shown after Route has been selected.
*/
function showActiveRoute() 
{
    //Get Route State
    var listener = new ROSLIB.Topic({
        ros: g_ros,
        name: T_ROUTE,
        messageType: M_ROUTE
    });

    listener.subscribe(function (message) 
    {
        //if route hasn't been selected.
        if (session_selectedRoute.name == 'No Route Selected')
            return;

        //If nothing on the list, set all selected checkboxes back to blue (or active).
        if (message.segments == null || message.segments.length == 0) 
        {
            $('#divCapabilitiesRoute').append(' There were no segments found the active route. ');
            $('#divCapabilitiesContent').css('display','inline-block');
            return;
        }

        //Only map the segment one time.
        console.log('routePlanCoordinates: ' + sessionStorage.getItem('routePlanCoordinates') );
        if (sessionStorage.getItem('routePlanCoordinates') == null) 
        {
           message.segments.forEach(mapEachRouteSegment);
        }
    });
}

// Will re-evaluate if this is still needed after more LaneLet info is published
// Loop through each available plugin

function mapEachRouteSegment(segment) 
{
    var segmentLat;
    var segmentLon;
    var position;
    var routeCoordinates; //To map the entire route

    console.log(segment.prev_waypoint.latitude);
    console.log(segment.prev_waypoint.longitude);
    console.log(segment.waypoint.longitude);
    console.log(segment.waypoint.longitude);
    
    //1) To map the route
    //create new list for the mapping of the route
    if (sessionStorage.getItem('routePlanCoordinates') == null) 
    {
        segmentLat = segment.prev_waypoint.latitude;
        segmentLon = segment.prev_waypoint.longitude;
        routeCoordinates = [];
        if(map_content_window != null)
        {
            position = new map_content_window.google.maps.LatLng(segmentLat, segmentLon);
            routeCoordinates.push(position);
        }       
        sessionStorage.setItem('routePlanCoordinates', JSON.stringify(routeCoordinates));
    }
    else //add to existing list.
    {
        segmentLat = segment.waypoint.latitude;
        segmentLon = segment.waypoint.longitude;     
        routeCoordinates = sessionStorage.getItem('routePlanCoordinates');
        routeCoordinates = JSON.parse(routeCoordinates);
        if(map_content_window != null)
        {
            position = new map_content_window.google.maps.LatLng(segmentLat, segmentLon);
            routeCoordinates.push(position);
        }        
        sessionStorage.setItem('routePlanCoordinates', JSON.stringify(routeCoordinates));
    }
}
