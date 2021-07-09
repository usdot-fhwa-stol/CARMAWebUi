/**
 * rostopic pub -r 10 /lane_change cav_msgs/LaneChangeInfo "direction: 0 
distance_to_lanechange: 3.2"
**/

function subscribeLaneChangeTopics()
{
    //ROS topic here
    let listener = new ROSLIB.Topic({
        ros:g_ros,
        name: T_LANE_CHANGE,
        messageType: M_LANE_CHANGE
    });

    let laneChangeSVG = null;
    let left_arrow = null;
    let left_dot_1  = null;
    let left_dot_2  = null;
    let left_dot_3  = null;
    let right_arrow  = null;
    let right_dot_1  = null;
    let right_dot_2  = null;
    let right_dot_3  = null;

    //load Lane change svg DOM element
    let deferLaneChangeSVGInit = $.Deferred();

    if(laneChangeSVG == null || left_arrow == null 
        || left_dot_1 == null || left_dot_2 == null 
        || left_dot_3 == null || right_arrow == null
        || right_dot_1 == null || right_dot_2 == null
        || right_dot_3 == null)
        {
            let loadLaneChangeObj = setInterval(()=>{
                let laneChangeObj = document.getElementById('lane-change-img-id') ;
                if(laneChangeObj!=null && laneChangeObj.contentDocument != null)
                {
                    laneChangeSVG = laneChangeObj.contentDocument;
                    //update direction          
                    left_arrow = laneChangeSVG.getElementById('left-arrow');
                    left_dot_1 = laneChangeSVG.getElementById('left-dot-1');
                    left_dot_2 = laneChangeSVG.getElementById('left-dot-2');
                    left_dot_3 = laneChangeSVG.getElementById('left-dot-3');
                    right_arrow = laneChangeSVG.getElementById('right-arrow');
                    right_dot_1 = laneChangeSVG.getElementById('right-dot-1');
                    right_dot_2 = laneChangeSVG.getElementById('right-dot-2');
                    right_dot_3 = laneChangeSVG.getElementById('right-dot-3');
                    if(laneChangeSVG!= null && left_arrow!=null && left_dot_1 !=null && left_dot_2 !=null && left_dot_3 !=null
                        && right_arrow!=null && right_dot_1 !=null && right_dot_2 !=null && right_dot_3 !=null)
                        {
                            deferLaneChangeSVGInit.resolve("Lane change svg is loaded");
                            clearInterval(loadLaneChangeObj);
                        }
                }
            }, 500);
        }
        else //lane change SVG already loaded
        {
            deferLaneChangeSVGInit.resolve("Lane change svg is loaded");
        }
   
     
    //Lane change svg DOM element READY
     $.when(deferLaneChangeSVGInit) 
     .done((successMessage)=>{
        //listener here
            listener.subscribe((message)=>{
                let miles = (message.downtrack_until_lanechange*METER_TO_MILE).toFixed(1);
                let direction = message.lane_change;
                //update miles
                updateLaneChange(laneChangeSVG, miles);

                //turn left
                if(direction == LANE_CHANGE_DIRECTION_TO_LEFT) // ToLeft
                {
                    left_arrow.classList.add('cls-blue');
                    left_arrow.classList.remove('cls-gray');

                    left_dot_1.classList.add('cls-white');
                    left_dot_1.classList.remove('cls-gray');

                    left_dot_2.classList.add('cls-white');
                    left_dot_2.classList.remove('cls-gray');

                    left_dot_3.classList.add('cls-white');
                    left_dot_3.classList.remove('cls-gray');

                    right_arrow.classList.add('cls-gray');
                    right_arrow.classList.remove('cls-blue');

                    right_dot_1.classList.add('cls-gray');
                    right_dot_1.classList.remove('cls-white');

                    right_dot_2.classList.add('cls-gray');
                    right_dot_2.classList.remove('cls-white');

                    right_dot_3.classList.add('cls-gray');
                    right_dot_3.classList.remove('cls-white');
                }
                //turn right
                else if (direction == LANE_CHANGE_DIRECTION_TO_RIGHT)  //ToRight
                {
                    right_arrow.classList.add('cls-blue');
                    right_arrow.classList.remove('cls-gray');

                    right_dot_1.classList.add('cls-white');
                    right_dot_1.classList.remove('cls-gray');

                    right_dot_2.classList.add('cls-white');
                    right_dot_2.classList.remove('cls-gray');

                    right_dot_3.classList.add('cls-white');
                    right_dot_3.classList.remove('cls-gray');

                    left_arrow.classList.add('cls-gray');
                    left_arrow.classList.remove('cls-blue');

                    left_dot_1.classList.add('cls-gray');
                    left_dot_1.classList.remove('cls-white');

                    left_dot_2.classList.add('cls-gray');
                    left_dot_2.classList.remove('cls-white');

                    left_dot_3.classList.add('cls-gray');
                    left_dot_3.classList.remove('cls-white');
                }
                else if (direction == LANE_CHANGE_DIRECTION_STAY_IN_LANE) //NONE : Stay in current lane
                {
                    right_arrow.classList.remove('cls-blue');
                    right_arrow.classList.add('cls-gray');

                    right_dot_1.classList.remove('cls-gray');
                    right_dot_1.classList.add('cls-white');

                    right_dot_2.classList.remove('cls-gray');
                    right_dot_2.classList.add('cls-white');

                    right_dot_3.classList.remove('cls-gray');
                    right_dot_3.classList.add('cls-white');

                    left_arrow.classList.remove('cls-blue');
                    left_arrow.classList.add('cls-gray');

                    left_dot_1.classList.remove('cls-gray');
                    left_dot_1.classList.add('cls-white');

                    left_dot_2.classList.remove('cls-gray');
                    left_dot_2.classList.add('cls-white');

                    left_dot_3.classList.remove('cls-gray');
                    left_dot_3.classList.add('cls-white');
                }
            })
        })
       
    .fail((error)=>{
        console.log('deferlaneChangeInit: '+ error);
     });
}

function GetLaneChangeStatus()
{
    SubscribeToLaneChangeStatus();
}

//subscribe to topic lane_change_status
/***
 * uint8   PLAN_SENT=1
uint8   REQUEST_RECEIVED=2
uint8   REQUEST_ACCEPTED=3
uint8   REQUEST_REJECTED=4
uint8   RESPONSE_SENT=5
uint8   ACCEPTANCE_RECEIVED=6
uint8   REJECTION_RECEIVED=7
uint8   OTHER_RECEIVED=8
uint8   PLANNING_SUCCESS=9
uint8   TIMED_OUT=10
 * Mockup publish topic
 * rostopic pub -r 1 /lane_change_status cav_msgs/LaneChangeStatus "status: 0
description: ''"
*/
function SubscribeToLaneChangeStatus()
{
    let listener = new ROSLIB.Topic({
        ros: g_ros,
        name: T_LANE_CHANGE_STATUS,
        messageType: M_LANE_CHANGE_STATUS
    });

    //check if planning is success. Planning successs means the vehicle merges to target lane
    const PLANNING_SUCCESS = 9;

    listener.subscribe(function (message) 
    {
        if(message != null && message.status != null &&  message.status == PLANNING_SUCCESS)
        {
            $('#divLaneChangeStatusContent').empty();     
        }

        if(message!=null && message.description !=null && message.description.trim().length > 0 )
        {               
            let wrapper = document.getElementById('lane_change_status_wrapper');
            let description_dev = document.getElementById('lane_change_status_description_id');
            let status_icon = document.getElementById('img_lane_change_status_icon_id');
            if(wrapper != null && wrapper != 'undefined'
                && description_dev != null && description_dev != 'undefined'
                && status_icon != null && status_icon != 'undefined')
            {   
                updateLaneChangeStatus(false, getImgPathBorderClassBYLaneChangeStatus(message.status).imgPath, message.description);
            }
            else
            {
               let laneChangeStatusDiv = createLaneChangeStatus(false, getImgPathBorderClassBYLaneChangeStatus(message.status).imgPath, message.description);
               $('#divLaneChangeStatusContent').append(laneChangeStatusDiv);        
            }

            $('#lane_change_status_wrapper').removeClass(function(index,css){
                return (css.match(/(^|\s)border-\w*/g) || []).join(' ');
            });
            
            $('#lane_change_status_wrapper').addClass(getImgPathBorderClassBYLaneChangeStatus(message.status).borderClass);
            $('#divLaneChangeStatusContent').css('display','');
        }
    });
}

/**
 * Map the lane change status to the coresponding image
 * @param {*} lane_change_status 
 */
function getImgPathBorderClassBYLaneChangeStatus(lane_change_status)
{
    let lane_change_statuses={
        PLAN_SENT: {
            id: 1,
            imgPath: "../../images/lane_merge_warning.png",
            borderClass: "border-warning" 
        },
        REQUEST_RECEIVED: {
            id: 2,
            imgPath: "../../images/lane_merge_warning.png",
            borderClass: "border-warning" 
        },
        REQUEST_ACCEPTED: {
            id: 3,
            imgPath: "../../images/hand_shake_green.png",
            borderClass: "border-good" 
        },
        REQUEST_REJECTED: {
            id: 4,
            imgPath: "../../images/handshake-slash-solid.svg",
            borderClass: "border-warning" 
        },
        RESPONSE_SENT: {
            id: 5,
            imgPath: "../../images/lane_merge_warning.png",
            borderClass: "border-warning" 
        },
        ACCEPTANCE_RECEIVED: {
            id: 6,
            imgPath: "../../images/hand_shake_green.png",
            borderClass: "border-good" 
        },
        REJECTION_RECEIVED: {
            id: 7,
            imgPath: "../../images/handshake-slash-solid.svg",
            borderClass: "border-warning" 
        },
        OTHER_RECEIVED: {
            id: 8,
            imgPath: "../../images/unknown_lane_change_status_orange.png",
            borderClass: "border-warning" 
        },
        PLANNING_SUCCESS: {
            id: 9,
            imgPath: "../../images/hand_shake_green.png",
            borderClass: "border-good" 
        },
        TIMED_OUT: {
            id: 10,
            imgPath: "../../images/time-out-solid.svg",
            borderClass: "border-warning" 
        },
        UNKOWN: {
            id: 999,
            imgPath: "../../images/unknown_lane_change_status_orange.png",
            borderClass: "border-warning" 
        }
    } //End of lane change statuses enumeration structure

    //Comparing lane change status with the enumeration to determine the imgPath to return
    switch(lane_change_status)
    {
        case lane_change_statuses.PLAN_SENT.id:
            return lane_change_statuses.PLAN_SENT;

        case lane_change_statuses.REQUEST_RECEIVED.id:
            return lane_change_statuses.REQUEST_RECEIVED;

        case lane_change_statuses.REQUEST_ACCEPTED.id:
            return lane_change_statuses.REQUEST_ACCEPTED;

        case lane_change_statuses.REQUEST_REJECTED.id:
            return lane_change_statuses.REQUEST_REJECTED;

        case lane_change_statuses.RESPONSE_SENT.id:
            return lane_change_statuses.RESPONSE_SENT;

        case lane_change_statuses.ACCEPTANCE_RECEIVED.id:
            return lane_change_statuses.ACCEPTANCE_RECEIVED;

        case lane_change_statuses.REJECTION_RECEIVED.id:
            return lane_change_statuses.REJECTION_RECEIVED;

        case lane_change_statuses.OTHER_RECEIVED.id:
            return lane_change_statuses.OTHER_RECEIVED;

        case lane_change_statuses.PLANNING_SUCCESS.id:
            return lane_change_statuses.PLANNING_SUCCESS;

        case lane_change_statuses.TIMED_OUT.id:
            return lane_change_statuses.TIMED_OUT;
        
        default :
            return lane_change_statuses.UNKOWN;
    }
}