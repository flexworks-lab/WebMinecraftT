const DEV_EMAIL = "worthmarcus19@gmail.com";
const DISCUSSION_COLLECTION = "discussions";
const CHANNELS = ["bugs", "chat"];

let firebaseReady = null;
let panel = null;
let statusEl = null;
let messageList = null;
let maintenanceEnabled = false;
let maintenanceUnsubscribe = null;
