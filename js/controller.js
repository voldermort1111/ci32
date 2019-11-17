const controller = {}

controller.initAuth = function () {
    firebase.auth().onAuthStateChanged(authStateChangeHandler)

    function authStateChangeHandler(user) {
        console.log(">>")
        console.log(user)
        if (user && user.emailVerified) {
            view.showComponent('chat')
        } else {
            console.log('<<')
            view.showComponent('logIn')
        }
    }
}
//syncr
// callback -Promise - async/await
// async/awaitsx
controller.register = async function (registerInfo) {
    //1. tao user
    //2. update name for user
    //3. send email confirm
    let email = registerInfo.email
    let password = registerInfo.password
    let displayName = registerInfo.firstname + " " + registerInfo.lastname
    view.setText('register-error', '')
    view.setText('register-success', '')

    view.disable('register-btn')

    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password)
        await firebase.auth().currentUser.updateProfile({
            displayName: displayName
        })
        await firebase.auth().currentUser.sendEmailVerification()
        view.setText('register-success', 'An verification email has been sent to your email address!')
    } catch (err) {
        view.setText('register-error', err.message)
    }

    //enable
    view.enable('register-btn')

}
controller.logIn = async function (logInInfo) {
    //firebase.auth().signInWithEmailAndPassword()
    let email = logInInfo.email
    let password = logInInfo.password

    view.disable('log-in-btn')
    view.setText('login-error', '')
    view.setText('login-success', '')
    //login
    try {
        let result = await firebase.auth().signInWithEmailAndPassword(email, password)
        // await firebase.auth().signInWithEmailAndPassword(email, password)

        if (!result.user.emailVerified) {

            throw new Error('Email Verification Error')
        }
        view.setText('login-success', 'Login success')
        view.showComponent('chat')
    } catch (err) {
        view.enable('log-in-btn')
        view.setText('login-error', err.message)
    }

}

// try {
//     console.log(1)
//     console.log(2)
//     throw new Error('Error!')
//     console.log(3)
// }catch(err) {
//     console.log(err.message);
// }
// console.log(6);
// console.log(7);

controller.loadConversations = async function () {
    let result = await firebase
        .firestore()
        .collection('conversations')
        .where('users', 'array-contains', firebase.auth().currentUser.email)
        .get()
    // .add() update() delete()
    let conversations = []
    for (let doc of result.docs) {
        // console.log(doc)
        // console.log(transformDoc(doc))
        conversations.push(transformDoc(doc))
    }
    model.saveConversations(conversations)
    console.log(conversations)
    if (conversations.length) {
        model.saveCurrentConversation(conversations[0])
    }
    view.showCurrentConversation() //model.currentConversation
    view.showListConversations() //model.conversations
}
function transformDoc(doc) {
    let data = doc.data()
    data.id = doc.id
    return data
}

controller.addMessage = async function (messageContent) {
    if (messageContent && model.currentConversation) {
        let message = {
            content: messageContent,
            owner: firebase.auth().currentUser.email,
            createdAt: new Date().toISOString()
        }
        view.disable('form-chat-btn')
        await firebase
            .firestore()
            .collection('conversations')
            .doc(model.currentConversation.id)
            .update({
                messages: firebase.firestore.FieldValue.arrayUnion(message) // thêm mess vào trường Mess
            })
        document.getElementById('message-input').value = ""
        view.enable('form-chat-btn')
    }
}

controller.addConversation = async function (title, friendEmail) {
    view.disable('form-add-conversation-submit-btn')
    try {

        let signInMethods = await firebase.auth().fetchSignInMethodsForEmail(friendEmail)
        // người dùng có thể đăng nhập vào hệ thống >> email có tồn tại

        if (signInMethods && signInMethods.length) {
            let conversation = {
                messages: [],
                title: title,
                users: [firebase.auth().currentUser.email, friendEmail],
                createdAt: new Date().toISOString()
            }
            await firebase
                .firestore()
                .collection('conversations')
                .add(conversation)
        } else {
            throw new Error('Email do not exists!')
        }
    } catch (err) {
        console.log(err);
        view.setText('friend-email-error', err.message)
    }
    view.enable('form-add-conversation-submit-btn')
}

controller.setupOnSnapShot = function () {
    let isFirstTimeRun = true
    firebase
        .firestore()
        .collection('conversations')
        .where('users', 'array-contains', firebase.auth().currentUser.email)
        .onSnapshot(snapshotHandler)

    function snapshotHandler(snapshot) {
        if (isFirstTimeRun) { // bỏ qua lần chạy đầu tiên
            isFirstTimeRun = false
            return
        }
        //kiểm tra thay đổi từ database
        // console.log(snapshot.docChanges()) //
        for (let docChange of snapshot.docChanges()) {
            if (docChange.type == 'modified') {
                let conversation = transformDoc(docChange.doc)
                //1. update conversation vao model
                model.updateConversation(conversation)
                //2. update conversation vào view
                if (model.currentConversation && model.currentConversation.id == conversation.id) {
                    view.showCurrentConversation()
                }

            }
        }
    }
}