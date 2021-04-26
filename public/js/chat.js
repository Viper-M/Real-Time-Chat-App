const socket = io()

const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationmessageTemplate = document.querySelector('#location-message-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix : true })

socket.on('locationmessage',(message)=>{
    console.log(message)
    const html = Mustache.render(locationmessageTemplate, {
        url : message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        message: message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

document.querySelector('#send-message').addEventListener('click',(e)=>{
    e.preventDefault()

    const message = document.querySelector('input').value

    socket.emit('sendmessage' , message , (error)=>{
        if(error){
            console.log(error)
        }
        else{
        console.log('Message is delivered')
        }
    })
})

document.querySelector('#send-location').addEventListener('click', () => {

    if(!navigator.geolocation){
        return alert("Your browser doesn't support Geolocation")
    }
    
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendlocation',{
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        }, () => {
            console.log('Location Shared!')
        })
    })
})

socket.emit('join', {username,room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})