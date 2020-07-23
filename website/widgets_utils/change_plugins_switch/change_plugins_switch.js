/**
 * create switch button with label to 
 * display change plugin switch
 */
function createChangePluginSwitch(isRequired, pluginName,pluginType,isActivated){
    let p = document.createElement('p');
    p.classList.add('card-text',pluginType);

    let switchLabel = document.createElement('label');
    switchLabel.classList.add('switch');

    let checkboxInput = document.createElement('input');
    checkboxInput.setAttribute("type", "checkbox");
    checkboxInput.value = pluginName;

    if(isActivated) checkboxInput.checked = true;

    let sliderSpan = document.createElement('span');
    sliderSpan.classList.add('slider','round');

    let requiredSpan = document.createElement('span');
    if(isRequired)
    {        
        requiredSpan.classList.add('text-red');
        requiredSpan.style.verticalAlign = '-30%';
        requiredSpan.innerHTML='*';
    }

    let pluginNameSpan = document.createElement('span');
    pluginNameSpan.style.verticalAlign='-30%';
    pluginNameSpan.innerHTML = pluginName;

    switchLabel.appendChild(checkboxInput);
    switchLabel.appendChild(sliderSpan);
    p.appendChild(switchLabel);

    if(isRequired) p.appendChild(requiredSpan);
    p.appendChild(pluginNameSpan);
    return p;
}

//call function
// $(document).ready(function () {
//     $('#strategic-plugins-section').append(createChangePluginSwitch(true,'Route Following','strategic-plugins',true));
//     $('#tactical-plugins-section').append(createChangePluginSwitch(true,'Platooning','tactical-plugins',true));
//     $('#controlling-plugins-section').append(createChangePluginSwitch(true,'Pure Pursuit','controlling-plugins',true));
// })
