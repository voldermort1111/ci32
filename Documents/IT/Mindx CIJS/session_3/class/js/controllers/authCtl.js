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