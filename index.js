//Please see these docs: https://open-wa.github.io/wa-automate-nodejs/classes/client.html#middleware
require('dotenv').config();
const { create } = require("@open-wa/wa-automate");
const axios = require("axios");
const fs = require("fs");
const log = require('morgan');

const { default: PQueue } = require("p-queue");
const queue = new PQueue({ concurrency: 5 });

const express = require("express");
const app = express();
app.use(express.json());
app.use(log());
const PORT = 8080;

//Create your webhook here: https://webhook.site/
const WEBHOOK_ADDRESS = process.env.WEBHOOK_ADDRESS || "https://webhook.site/2489fd1d-4844-4535-86c0-802e01e461db";

async function fire(data) {
  return await axios.post(WEBHOOK_ADDRESS, data);
}

const hook = (event, client) => async (data) => {
  const ts = Date.now();
  if (event == "state_change" && (data == "CONFLICT" || data == "UNLAUNCHED")) client.forceRefocus();
  return await queue.add(() =>
    fire({
      ts,
      event,
      data,
    })
  );
};

const reqHook = (event, data) => {
  const ts = Date.now();
  return queue.add(() => fire({
    ts,
    event,
    data,
  }))
}

app.listen(PORT, function () {
  console.log(`\n• Listening on port ${PORT}!`);
});

const availableSessions = {};

const start = (license, res) =>
  create(license, {licenseKey: 'INHORID-HEROKUAPP-COM-SULLA'})
    .then(async (client) => {
      // storing session
      availableSessions[license] = client;
      // FREE listener
      await client.onAck(hook("ack"));
      await client.onAddedToGroup(hook("added_to_group"));
      await client.onAnyMessage(hook("any_message"));
      await client.onBattery(hook("battery"));
      // await client.onGlobalParicipantsChanged(hook("participant_change"));
      await client.onIncomingCall(hook("incoming_call"));
      await client.onMessage(hook("incoming_message"));
      await client.onPlugged(hook("charger_state"));
      await client.onRemovedFromGroup(hook("remove_from_group"));
      await client.onStateChanged(hook("state_change", client));
      // INSIDERS listener
      // await client.onChatOpened(hook("chat_opened"));
      // await client.onChatState(hook("chat_state"));
      // await client.onContactAdded(hook("new_contact"));
      // STORY listener
      // await client.onStory(hook("new_story"));
      if (res) res.status(200).json({ message: "successfully" });
    })
    .catch((error) => {
      if (res) res.status(400).json({ message: error.message });
    });

app.all('/', (req, res) => {
  res.status(200).json({message: 'welcome to whatsapp gateway powered by https://jasadigitalin.com'})
})

app.post("/api/v1/register", async (req, res) => {
  const { license } = req.body;
  // check license
  // creating session
  await start(license, res);
  // labeling used license
});

app.use("/api/v1/:key/", async (req, res) => {
  let dataString;
  const availableMethod = {
    POST: {
      addLabel: ["label:string", "id:string"],
      addParticipant: ["groupId:string", "participantId:string"],
      archiveChat: ["id:string", "archive:boolean"],
      checkNumberStatus: ["contactId:string"],
      clearChat: ["chatId:string"],
      contactBlock: ["id:string"],
      contactUnblock: ["id:string"],
      cutMsgCache: [],
      createGroup: ["groupName:string", "contacts:object"],
      deleteAllStatus: [],
      deleteChat: ["chatId:string"],
      deleteMessage: ["contactId:string", "messageId:object"],
      deleteStatus: ["statusesToDelete:object"],
      demoteParticipant: ["groupId:string", "participantId:string"],
      downloadFileWithCredentials: ["url:string"],
      downloadProfilePicFromMessage: ["message:string"],
      forceRefocus: [],
      forceUpdateLiveLocation: ["chatId:string"],
      forwardMessages: [
        "to:string",
        "messages:object",
        "skipMyMessages:boolean",
      ],
      ghostForward: ["to:ChatId", "messageId:MessageId"],
      joinGroupViaLink: ["link:string"],
      kill: [],
      leaveGroup: ["groupId:string"],
      markAsUnread: ["chatId:string"],
      middleware: [],
      // INSIDERS request
      clearAllChats: [],
      darkMode: ["activate"],
      postImageStatus: ["data:string", "caption:string"],
      postTextStatus: [
        "text:string",
        "textRgba:string",
        "backgroundRgba:string",
        "font:number",
      ],
      postVideoStatus: ["data:string", "caption:string"],
      promoteParticipant: ["groupId:string", "participantId:string"],
      refresh: [],
      registerWebhook: ["event:string", "url:string"],
      removeLabel: ["label:string", "id:string"],
      removeParticipant: ["groupId:string", "participantId:string"],
      reply: ["chatId:string"],
      revokeGroupInviteLink: [
        "to:string",
        "content:string",
        "quotedMsgId:string",
      ],
      sendContact: ["to:string", "contactId:object"],
      sendFile: [
        "to:string",
        "base64:string",
        "filename:string",
        "caption:string",
      ],
      sendFileFromUrl: [
        "to:string",
        "url:string",
        "filename:string",
        "caption:string",
      ],
      sendGiphy: ["to:string", "giphyMediaUrl:string", "caption:string"],
      sendImage: [
        "to:string",
        "base64:string",
        "filename:string",
        "caption:string",
      ],
      sendImageAsSticker: ["to:string", "b64:string"],
      sendImageWithProduct: [
        "to:string",
        "base64:string",
        "caption:string",
        "bizNumber:string",
        "productId:string",
      ],
      sendLinkWithAutoPreview: ["to:string", "url:string"],
      sendLocation: ["to:string", "lat:string", "lng:string", "loc:string"],
      sendMessageWithThumb: [
        "thumb:string",
        "url:string",
        "title:string",
        "description:string",
        "text:string",
        "chatId:string",
      ],
      sendPtt: ["to:string", "base64:string", "quotedMsgId:string"],
      sendRawWebpAsSticker: ["to:string", "webpBase64:string"],
      sendReplyWithMentions: [
        "to:string",
        "content:string",
        "replyMessageId:string",
      ],
      sendSeen: ["chatId:string"],
      sendStickerfromUrl: ["to:string", "url:string"],
      sendText: ["to:string", "content:string"],
      sendTextWithMentions: ["to:string", "content:string"],
      sendVCard: ["chatId:string", "vcard:string", "contactName:string"],
      sendVideoAsGif: [
        "to:string",
        "base64:string",
        "filename:string",
        "caption:string",
      ],
      sendYoutubeLink: ["to:string", "url:string"],
      setChatBackgroundColourHex: ["hex:string"],
      setChatState: ["chatState:number", "chatId:string"],
      setGroupEditToAdminsOnly: ["groupId:string", "onlyAdmins:boolean"],
      setGroupIcon: ["groupId:string", "b64:string"],
      setGroupIconByUrl: ["groupId:string", "url:string"],
      setGroupToAdminsOnly: ["groupId:string", "onlyAdmins:boolean"],
      setMyName: ["newName:string"],
      setMyStatus: ["newStatus:string"],
      setPresence: ["available:boolean"],
      setProfilePic: ["data:string"],
      simulateTyping: ["to:string", "on:boolean"],
      syncContacts: [],
    },
    GET: {
      getAllChats: [],
      getAllChatsWithMessages: [],
      getAllContacts: [],
      getAllGroups: [],
      getAllMessagesInChat: [
        "chatId:string",
        "includeMe:boolean",
        "includeNotifications:boolean",
      ],
      getAllNewMessages: [],
      getAllUnreadMessages: [],
      getAmountOfLoadedMessages: [],
      getBatteryLevel: [],
      getBusinessProfilesProducts: ["id:string"],
      getChat: ["contactId:string"],
      getChatById: ["contactId:string"],
      getChatWithNonContacts: [],
      getCommonGroups: ["contactId:string"],
      getConfig: [],
      getConnectionState: [],
      getContact: ["contactId:string"],
      getGeneratedUserAgent: [],
      getGroupAdmins: ["groupId:string"],
      getGroupInviteLink: ["chatId:string"],
      getGroupMembers: ["groupId:string"],
      getGroupMembersId: ["groupId:string"],
      getHostNumber: [],
      getIndicatedNewMessages: [],
      getIsPlugged: [],
      getLastSeen: [],
      getMe: [],
      getMessageById: ["messageId:string"],
      getMyStatusArray: [],
      getPage: [],
      getProfilePicFromServer: ["chatId:string"],
      getSessionInfo: [],
      getSingleProperty: ["namespace:string", "id:string", "property:string"],
      getStatus: ["contactId:string"],
      getStickerDecryptable: ["messageId:string"],
      getStoryViewers: ["id:string"],
      getUnreadMessages: [
        "includeMe:boolean",
        "includeNotifications:boolean",
        "use_unread_count:boolean",
      ],
      getVCards: ["msgId:string"],
      getWAVersion: [],
      iAmAdmin: [],
      inviteInfo: ["link:string"],
      isChatOnline: ["chatId:string"],
      isConnected: [],
      loadAllEarlierMessages: ["contactId:string"],
      loadAndGetAllMessagesInChat: [
        "chatId:ChatId",
        "includeMe:boolean",
        "includeNotifications:boolean",
      ],
      loadEarlierMessages: ["contactId:string"],
    },
  };
  const method = req.method;
  const { key } = req.params;
  console.log(req.params);
  if (method === "POST") {
    dataString = req.body;
  } else if (method === "GET") {
    dataString = req.query;
  } else {
    return res.send(`cannot ${method} /api/v1/${key}`);
  }
  console.log(dataString);
  if (
    Object.keys(availableMethod).includes(method) &&
    Object.keys(availableMethod[method]).includes(key)
  ) {
    const data = availableMethod[method][key].map((fieldAndType) => {
      const [field, type] = fieldAndType.split(":");
      let reqDataType, reqData;
      if (!dataString[field])
        return res
          .status(400)
          .json({ message: `data ${field} is required!`, data: dataString });
      try {
        reqDataType = typeof JSON.parse(dataString[field]);
        reqData = JSON.parse(dataString[field]);
      } catch (e) {
        reqDataType = "string";
        reqData = dataString[field];
      }
      if (reqDataType !== type)
        return res
          .status(400)
          .json({ message: `data type of ${field} should be ${type}` });
      return reqData;
    });
    try {
      if (method === "POST") {
        const result = await queue.add(() =>
          availableSessions[req.body.license][key](...data).then(result1 => reqHook(key, result1))
        );
        res
          .status(200)
          .json({ message: "successfully added to queue", data: result });
      } else {
        const result = await availableSessions[req.query.license][key](...data);
        reqHook(key, result);
        res.status(200).json({ message: "successfully", data: result });
      }
    } catch (e) {
      res.status(400).json({ message: e.message, data: e });
    }
  } else {
    res.status(400).json({ message: `cannot ${method} /api/v1/${key}` });
  }
});

// auto start
const sessionFiles = fs
  .readdirSync(".")
  .filter((file) => file.endsWith(".data.json"));
console.log(sessionFiles);
for (const file of sessionFiles) {
  const sessionId = file.replace(".data.json", "");
  console.log(sessionId);
  queue.add(() => start(sessionId)).then((_) => null);
}
