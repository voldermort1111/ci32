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