// import {appConfig, ChatEntry, AppStorage, ModelEnum, ModelChat, VendorEnum} from "../src";
// import * as firebase from "firebase-admin"
// import {UserWork} from "../lib";
// firebase.initializeApp({credential: firebase.credential.cert(appConfig.fireBaseServiceAccountKey)});
//
// firebase.firestore().settings({
//     ignoreUndefinedProperties:true}
// )
//
// const model = new ModelChat(firebase.firestore())
// const storage = new AppStorage(firebase.firestore())
//
// describe('Query model', () => {
//
//     it('Simple one message', async () => {
//         const ret = await model.simpleMessage("what is firebase")
//         expect(ret).toBeDefined()
//     })
//
//     it('chatentry one message', async () => {
//         const chatEntry: ChatEntry = {
//             uid: "leif",
//             entry: [
//                 {role: "user", content: "hello chatgpt"}
//             ]
//         }
//         const ret = await model.chatMessage(chatEntry)
//         expect(ret).toBeDefined()
//     })
//
//     it('chatentry one message with descriptor', async () => {
//         const chatEntry: ChatEntry = {
//             uid: "leif",
//             queryDescriptor: {
//                 vendor: VendorEnum.chatGpt,
//                 modelId: ModelEnum.gpt4,
//                 name: "this is a test",
//                 queryParameters:  {
//                     queryType: "chat",
//                     maxTokens: 500,
//                     // how deeps is model search (0-1), 1, very deeps
//                     temperature: 0.5,
//                     instructions: "you are an assistant"
//                 }
//
//             },
//             entry: [
//                 {role: "user", content: "hello chatgpt"}
//             ]
//         }
//         const ret = await model.chatMessage(chatEntry)
//         expect(ret).toBeDefined()
//         expect(ret.queryDescriptor).toBeDefined()
//         expect(ret.queryDescriptor?.id).toBeUndefined()
//         expect(ret.queryDescriptor?.uid).toBeUndefined()
//
//     })
//
//     it('chatentry one message with descriptor more messages', async () => {
//         const chatEntry: ChatEntry = {
//             uid: "leif",
//             queryDescriptor: {
//                 vendor: VendorEnum.chatGpt,
//                 modelId: ModelEnum.gpt4,
//                 name: "this is a test",
//                 queryParameters:  {
//                     queryType: "chat",
//                     maxTokens: 500,
//                     // how deeps is model search (0-1), 1, very deeps
//                     temperature: 0.5,
//                     instructions: "you will answer as you are angry"
//                 }
//
//             },
//             storeChat: true,
//             entry: [
//                 {role: "user", content: "hello chatgpt,what are you"}
//             ]
//         }
//         const ret = await model.chatMessage(chatEntry)
//         expect(ret).toBeDefined()
//         expect(ret.title).toBeDefined()
//         expect(ret.title).toBe("hello chatgpt,what are you")
//
//         expect(ret.qid).toBeUndefined()
//         expect(ret.queryDescriptor).toBeDefined()
//         expect(ret.queryDescriptor?.id).toBeUndefined()
//         expect(ret.queryDescriptor?.uid).toBeUndefined()
//
//         // new message
//         chatEntry.entry = [
//             {role: "user", content: "explain more"}
//         ]
//
//         const ret2 = await model.chatMessage(chatEntry)
//         expect(ret2).toBeDefined()
//         expect(ret2.queryDescriptor).toBeDefined()
//         expect(ret2.qid).toBeUndefined()
//         expect(ret2.title).toBeDefined()
//         expect(ret2.title).toBe("hello chatgpt,what are you")
//
//         if(chatEntry.uid && chatEntry.did) {
//             const dialog = await storage.getDialog(chatEntry.did, chatEntry.uid)
//             expect(dialog).toBeDefined()
//             expect(dialog?.entries).toBeDefined()
//             expect(dialog?.entries?.length).toBe(2)
//             if(dialog?.entries && dialog?.entries) {
//                 const entry = dialog?.entries[0].entry
//                 if (entry) {
//                     expect(entry[0].content).toBe("hello chatgpt,what are you")
//                 }
//             }
//         }
//
//     },1000*300)
//
//     it('chatentry store decriptor', async () => {
//
//         const descriptor = await storage.storeDescriptor("leif",{
//             vendor: VendorEnum.chatGpt,
//             modelId: ModelEnum.gpt4,
//             name: "this is a test",
//             queryParameters:  {
//                 queryType: "chat",
//                 maxTokens: 500,
//                 // how deeps is model search (0-1), 1, very deeps
//                 temperature: 0.5,
//                 instructions: "you will answer as you are angry"
//             }
//
//         })
//         expect(descriptor).toBeDefined()
//         expect(descriptor.id).toBeDefined()
//         expect(descriptor.uid).toBeDefined()
//         expect(descriptor.uid).toBe("leif")
//
//         const chatEntry: ChatEntry = {
//             uid: "leif",
//             qid: descriptor.id,
//             entry: [
//                 {role: "user", content: "hello chatgpt,what are you"}
//             ]
//         }
//         const ret = await model.chatMessage(chatEntry)
//         expect(ret).toBeDefined()
//         expect(ret.qid).toBeDefined()
//         expect(ret.queryDescriptor).toBeUndefined()
//
//         // new message
//         chatEntry.entry = [
//             {role: "user", content: "explain more"}
//         ]
//
//         const ret2 = await model.chatMessage(chatEntry)
//         expect(ret2).toBeDefined()
//         expect(ret2.qid).toBeDefined()
//         expect(ret2.uid).toBe("leif")
//
//         if(chatEntry.uid && chatEntry.did) {
//             const dialog = await storage.getDialog(chatEntry.did,chatEntry.uid)
//             expect(dialog).toBeDefined()
//             expect(dialog?.entries).toBeDefined()
//             expect(dialog?.entries?.length).toBe(2)
//             if(dialog?.entries && dialog?.entries) {
//                 const entry = dialog?.entries[0].entry
//                 if (entry) {
//                     expect(entry[0].content).toBe("hello chatgpt,what are you")
//                 }
//             }
//         }
//
//     },1000*300)
//
//     it('chatentry 2 messages with history', async () => {
//         const chatEntry: ChatEntry = {
//             uid: "leif",
//             entry: [
//                 {role: "user", content: "what is firebase"}
//             ]
//         }
//         const ret = await model.chatMessage(chatEntry)
//         expect(ret).toBeDefined()
//         expect(ret.history).toBeDefined()
//         expect(ret.replies).toBeDefined()
//         expect(ret.history?.length).toBe(1)
//
//         chatEntry.replies = undefined
//         chatEntry.entry = [
//             {role: "user", content: "is it a good tool"}
//         ]
//         const ret2 = await model.chatMessage(chatEntry)
//         expect(ret2).toBeDefined()
//         expect(ret2.history).toBeDefined()
//         expect(ret2.replies).toBeDefined()
//         expect(ret2.history?.length).toBe(2)
//
//     },1000*300)
//
//     // it('read user work', async () => {
//     //
//     //     const ret: UserWork = await storage.getUserWork("leif")
//     //     expect(ret).toBeDefined()
//     //     expect(ret.queries).toBeDefined()
//     //     expect(ret.dialogs).toBeDefined()
//     //
//     // },1000*300)
//
// });
