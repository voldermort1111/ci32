const model = {
    conversations: null, // tat ca cuoc hoi thoai
    currentConversation: null // cuoc hoi thoai người dùng đang trỏ vào  
}

model.saveConversations = function(conversations) {
    model.conversations = conversations
}

model.saveCurrentConversation = function(conversation){
    model.currentConversation = conversation
}

model.updateConversation = function(conversation){
    if(model.conversations){
        let  existedIndex = model.conversations.findIndex(function(element){ 
            //findIndex và find tìm kiếm trong mảng
            return element.id == conversation.id
        })
        if(existedIndex >=0 ){
            //đã tồn tại trong model.conversations
            model.conversations[existedIndex] = conversation
        }else {
            //chưa tồn tại trong model.conversations
            model.conversations.push(conversation)
        }
    }
    if(model.currentConversation && conversation.id == model.currentConversation.id){
        // console.log(model.currentConversation)
        // console.log(conversation)
        model.currentConversation = conversation
    }
}