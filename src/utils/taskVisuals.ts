export type TaskVisualKey = "wake" | "dress" | "breakfast" | "teeth" | "school" | "coat" | "hands" | "rest" | "study" | "shower" | "pajamas" | "sleep";

export function getTaskVisualKey(title: string, fallback: TaskVisualKey = "rest"): TaskVisualKey {
  const text = title.toLowerCase();
  if (text.includes("ochtend") || text.includes("opstaan") || text.includes("wakker")) return "wake";
  if (text.includes("aankleden") || text.includes("kleding") || text.includes("shirt") || text.includes("broek")) return "dress";
  if (text.includes("ontbijt") || text.includes("eten") || text.includes("drinken") || text.includes("beker")) return "breakfast";
  if (text.includes("tanden") || text.includes("poets")) return "teeth";
  if (text.includes("school") || text.includes("tas") || text.includes("broodtrommel") || text.includes("sportspullen")) return "school";
  if (text.includes("jas") || text.includes("schoenen")) return "coat";
  if (text.includes("handen") || text.includes("wassen")) return "hands";
  if (text.includes("rust") || text.includes("pauze") || text.includes("koptelefoon") || text.includes("rustige plek")) return "rest";
  if (text.includes("boek") || text.includes("lezen") || text.includes("agenda") || text.includes("huiswerk") || text.includes("teken")) return "study";
  if (text.includes("douche") || text.includes("douchen") || text.includes("bad")) return "shower";
  if (text.includes("pyjama") || text.includes("avond")) return "pajamas";
  if (text.includes("bed") || text.includes("slapen") || text.includes("scherm uit") || text.includes("bedtijd")) return "sleep";
  return fallback;
}
