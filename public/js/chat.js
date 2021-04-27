const socket = io()

const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationmessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const $sendMessage = document.querySelector('#send-message')
const $input = document.querySelector('input')
const $sendLocation = document.querySelector('#send-location')

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('locationmessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationmessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('message', (message) => {
    console.log(message)
    if (message.text == "") {
        return ''
    }
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomdata', ({ room, users }) => {
    console.log(room)
    console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#profile-section').innerHTML = ''
    document.querySelector('#profile-section').insertAdjacentHTML('beforeend', html)
})

$sendMessage.addEventListener('click', (e) => {
    e.preventDefault()
    $sendMessage.setAttribute('disabled', 'disabled')
    const message = document.querySelector('input').value

    socket.emit('sendmessage', message, (error) => {
        $sendMessage.removeAttribute('disabled')
        $input.value = ''
        $input.focus()

        if (error) {
            alert(error)
        }
        else {
            console.log('Message is delivered')
        }
    })
})

$sendLocation.addEventListener('click', () => {
    $sendLocation.setAttribute('disabled', 'disabled')
    if (!navigator.geolocation) {
        return alert("Your browser doesn't support Geolocation")
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendlocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocation.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})