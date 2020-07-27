/***
 * Defined ROS related functionalities
 * 
 * Parameters:
 * g_ros: a global variable defined in global_variables.js
 */
function connectToROS(isCARMAStarted) 
{
    try
    {
        // ROS related
        var ip = CarmaJS.Config.getIP();
        // If there is an error on the backend, an 'error' emit will be emitted.
        g_ros.on('error', function (error) 
        {
            //TODO: Not Connected ROS bridge. Show alert to restart or disengage users
            console.log(error);
        });

        // Find out exactly when we made a connection.
        g_ros.on('connection', function () 
        {
            console.log('connection success!!!');  
            if(!isCARMAStarted)
                window.location.href = "../main.html";
        });

        g_ros.on('close', function () 
        {
            //TODO: Not Connected ROS bridge. Show alert to restart or disengage users
            console.log('close'); 
        });

        // Create a connection to the rosbridge WebSocket server.
        g_ros.connect('ws://' + ip + ':9090');
        console.log('connect to ROS bridge...');
    }
    catch (err) {
        console.log(err);        
    }
}

/**
 * This is called before calling ros services 
 * and after the connectToROS(param) function is called 
 * because connectToROS(param) function initalize the ROS connection.
 */ 
function IsROSBridgeConnected() 
{
    try
    {
        console.log('Checking ROS Connection Status ...');
        g_ros.on('error', function (error) 
        {
            // $('#disengageModal').modal('show');
            //TODO: Not Connected ROS bridge. Show alert to restart or disengage users
            console.log(error);
        });

        // Find out exactly when we made a connection.
        g_ros.on('connection', function () 
        {
            console.log('connection success!!!');  
        });

        g_ros.on('close', function () 
        {
            // $('#disengageModal').modal('show');
            //TODO: Not Connected ROS bridge. Show alert to restart or disengage users
            console.log('close'); 
        });        
    }
    catch (err) {
        console.log(err);        
    }
}