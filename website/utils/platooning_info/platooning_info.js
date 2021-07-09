function createPlatooningInfo(platooning_state,host_vehicle_position,desired_gap,actual_gap,leader_vehicle_id,platoon_id,platoon_applied_speed)
{
    let divPlatoonWrapper = document.createElement('div');
    divPlatoonWrapper.id='platooning_info_wrapper';

    //host vehicle
    let p_host_div = document.createElement('div');
    
    let p_host_title = document.createElement("p");
    p_host_title.innerHTML = "HOST VEHICLE";
    p_host_title.classList.add( 'underline','title');
    p_host_div.append(p_host_title);

    let p_host_state = document.createElement('p');
    p_host_state.id = 'platooning_host_state_id';
    p_host_state.innerHTML = "PLATOON STATE: " + platooning_state;
    p_host_div.appendChild(p_host_state);

    let p_host_position = document.createElement('p');
    p_host_position.innerHTML = "POSITION: " + host_vehicle_position;
    p_host_position.id = 'platooning_host_position_id';
    p_host_div.appendChild(p_host_position);

    let p_host_desired_gap = document.createElement('p');
    p_host_desired_gap.innerHTML = "DESIRED GAP FROM LEADER: " + desired_gap + " METERS";
    p_host_desired_gap.id = 'platooning_desired_gap_id';
    p_host_div.appendChild(p_host_desired_gap);

    let p_host_actual_gap = document.createElement('p');
    p_host_actual_gap.innerHTML = "ACTUAL GAP FROM LEADER: " + actual_gap + " METERS";
    p_host_actual_gap.id = 'platooning_actual_gap_id';
    p_host_div.appendChild(p_host_actual_gap);

    //Leader vehicle
    let p_leader_div = document.createElement('div');
    
    let p_leader_title = document.createElement("p");
    p_leader_title.innerHTML = 'LEAD VEHICLE';
    p_leader_title.classList.add('underline','title');
    p_leader_div.append(p_leader_title);

    let p_leader_vehicle_id= document.createElement('p');
    p_leader_vehicle_id.innerHTML = "VEHICLE ID: " + leader_vehicle_id;
    p_leader_vehicle_id.id = 'platooning_leader_vehicle_id';
    p_leader_div.appendChild(p_leader_vehicle_id);

    let p_platoon_id = document.createElement('p');
    p_platoon_id.innerHTML = "PLATOON ID: " + platoon_id;
    p_platoon_id.id = 'platooning_id';
    p_leader_div.appendChild(p_platoon_id);

    let p_platoon_applied_speed = document.createElement('p');
    p_platoon_applied_speed.innerHTML = "PLATOON APPLIED SPEED: " + platoon_applied_speed+ " MPH";
    p_platoon_applied_speed.id = 'platooning_applied_speed_id';
    p_leader_div.appendChild(p_platoon_applied_speed);

    divPlatoonWrapper.appendChild(p_host_div);
    divPlatoonWrapper.appendChild(p_leader_div);
    return divPlatoonWrapper;
}

function updatePlatooningInfo(platooning_state,host_vehicle_position,desired_gap,actual_gap,leader_vehicle_id,platoon_id,platoon_applied_speed)
{
   document.getElementById('platooning_host_state_id').innerHTML ="PLATOON STATE: " + platooning_state;
   document.getElementById('platooning_host_position_id').innerHTML = "POSITION: " + host_vehicle_position;
   document.getElementById('platooning_desired_gap_id').innerHTML ="DESIRED GAP FROM LEADER: " + desired_gap + " METERS";
   document.getElementById('platooning_actual_gap_id').innerHTML = "ACTUAL GAP FROM LEADER: " + actual_gap + " METERS";
   document.getElementById('platooning_leader_vehicle_id').innerHTML ="VEHICLE ID: " +  leader_vehicle_id;
   document.getElementById('platooning_applied_speed_id').innerHTML ="PLATOON APPLIED SPEED: " +  platoon_applied_speed + " MPH";
   document.getElementById('platooning_id').innerHTML =  "PLATOON ID: " + platoon_id;
}

$(document).ready(function(){
    $('#platooning-info-content').append(createPlatooningInfo('N/A','N/A','N/A','N/A','N/A','N/A','N/A'));
});