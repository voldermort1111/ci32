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