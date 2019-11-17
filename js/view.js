const view = {}

view.showComponent = function (name) {
  switch (name) {
    case 'register': {
      let app = document.getElementById('app')
      app.innerHTML = components.register

      let formLink = document.getElementById('form-link')
      formLink.onclick = linkClickHandler

      let form = document.getElementById('register-form')
      form.onsubmit = formSubmitHandler

      function linkClickHandler() {
        view.showComponent('logIn')
      }

      function formSubmitHandler(event) {
        // chặn sự kiện mặc định >> không gửi thông tin user lên thanh địa chỉ
        event.preventDefault()

        // 1. lay thong tin nguoi dung dien vao form
        let registerInfo = {
          firstname: form.firstname.value,
          lastname: form.lastname.value,
          email: form.email.value,
          password: form.password.value,
          confirmPassword: form.confirmPassword.value
        }
        // 2. validate thong tin
        let validateResult = [
          view.validate(registerInfo.firstname, 'firstname-error', 'Invalid firstname'),
          view.validate(registerInfo.email, 'email-error', 'Invalid email'),
          view.validate(registerInfo.email, 'email-error', 'Invalid email'),
          view.validate(
            registerInfo.password && registerInfo.password.length >= 6,
            'password-error',
            'Invalid password'),
          view.validate(
            registerInfo.confirmPassword && registerInfo.confirmPassword == registerInfo.password,
            'confirm-password-error',
            'Invalid confirm password')
        ]
        if (allPassed(validateResult)) {
          // 3. submit thong tin
          controller.register(registerInfo)
        }
      }
      break
    }
    case 'logIn': {
      let app = document.getElementById('app')
      app.innerHTML = components.logIn

      let formLink = document.getElementById('form-link')
      formLink.onclick = linkClickHandler

      let form = document.getElementById('log-in-form')
      form.onsubmit = formSubmitHandler

      function linkClickHandler() {
        view.showComponent('register')
      }

      function formSubmitHandler(event) {
        //chan event mac dinh
        event.preventDefault()

        // 1. lay thong tin nguoi dung dien vao form
        let logInInfo = {
          email: form.email.value,
          password: form.password.value
        }

        // 2. validate thong tin
        let validateResult = [
          view.validate(logInInfo.email, 'email-error', 'Invalid email'),
          view.validate(
            logInInfo.password && logInInfo.password.length >= 6,
            'password-error',
            'Invalid password!'
          )
        ]

        //3. submit info
        if (allPassed(validateResult)) {
          controller.logIn(logInInfo)
        }

      }



      break
    }
    case 'chat': {
      let app = document.getElementById('app')
      app.innerHTML = components.nav + components.chat

      controller.loadConversations()
      controller.setupOnSnapShot() //nhận thay đổi từ database

      let btnSignOut = document.getElementById('sign-out-btn')
      btnSignOut.onclick = signOutHandler

      let formChat = document.getElementById('form-chat')
      formChat.onsubmit = formChatSubmitHandler

      let formAddConversation = document.getElementById('form-add-conversation')
      formAddConversation.onsubmit = formAddConversationSubmitHandler

      function signOutHandler() {
        firebase.auth().signOut()
      }
      function formChatSubmitHandler(e) {
        e.preventDefault()
        let messageContent = formChat.message.value.trim()
        if (messageContent) {
          controller.addMessage(messageContent)
        }
      }

      function formAddConversationSubmitHandler(e) {
        e.preventDefault()
        let title = formAddConversation.title.value
        let friendEmail = formAddConversation.friendEmail.value

        validateResult = [
          view.validate(title, 'title-error', 'Invalid title!'),
          view.validate(
            friendEmail && friendEmail != firebase.auth().currentUser.email,
            'friend-email-error',
            'Invalid friend email!'
          )
        ]

        if (allPassed(validateResult)) {
          console.log('asss');
          
          controller.addConversation(title, friendEmail)
        }

      }

      // let formLink = document.getElementById('form-link')
      // formLink.onclick = linkClickHandler

      // let form = document.getElementById('log-in-form')
      // form.onsubmit = formSubmitHandler

      // let username = document.getElementById('username')

      // username = firebase.auth().currentUser.displayName

      break;
    }
  }
}

view.setText = function (id, text) {
  document.getElementById(id).innerText = text;
}
view.validate = function (condition, idErrorTag, messageError) {
  if (condition) {
    view.setText(idErrorTag, '')
    return true
  } else {
    view.setText(idErrorTag, messageError)
    return false
  }
}

function allPassed(validateResult) {
  for (let result of validateResult) {
    if (!result) {
      return false
    }
  }
  return true
}
view.disable = function (id) {
  document.getElementById(id).setAttribute('disabled', true)
}

view.enable = function (id) {
  document.getElementById(id).removeAttribute('disabled')
}

view.showCurrentConversation = function () {
  if (model.currentConversation) {
    //TODO: hiển thị itn nhắn của currentConversation

    let messages = model.currentConversation.messages
    let listMessages = document.getElementById('list-messages')
    let currentEmail = firebase.auth().currentUser.email
    listMessages.innerHTML = ""

    document.getElementById("user-email").innerText = currentEmail
    document.getElementById("user-email").innerText += firebase.auth().currentUser.displayName
    for (let message of messages) {
      let className = ""
      if (message.owner == currentEmail) {
        className = "message-chat your"
      } else {
        className = "message-chat"
      }
      let html = `
          <div class="${className}">
            <span>${message.content}</span>
          </div>
          `
      listMessages.innerHTML += html
      listMessages.scrollTop = listMessages.scrollHeight
    }
  }
}

// /new Date().toISOString
view.showListConversations = function () {
  if (model.conversations) {

    //TODO: show all the conversations in model.conversation to div = "list-conversations"

    let listConversations = document.getElementById('list-conversations')
    let conversations = model.conversations
    let currentConversation = model.currentConversation
    listConversations.innerHTML = ""


    for (let conversation of conversations) {

      let id = conversation.id
      let title = conversation.title
      let members = conversation.users.length
      let className = ""

      if (currentConversation && conversation.id == currentConversation.id) {
        className = "conversation current"
      } else {
        className = "conversation"
      }

      let html = `
      <div id="conversation-${id}" class="${className}">
        <div class="conversation-title">${title}</div>
        <div class="conversation-members">${members} members</div>
      </div>
      `
      listConversations.innerHTML += html
    }
    for (let conversation of conversations) {
      let id = conversation.id
      let conversationDiv = document.getElementById(`conversation-${id}`)
      console.log(conversationDiv)

      conversationDiv.onclick = onclickHandler

      function onclickHandler() {
        //TODO
        console.log('click on conversation id');

      }
    }
    // gán sự kiện onclick
  }
}