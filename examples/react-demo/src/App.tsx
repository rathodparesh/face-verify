import { useState } from "react";
import { compareFaceEmbeddings } from "@rathodparesh/face-verify-core";
import { FaceVerificationStudio, JsonViewer } from "@rathodparesh/face-verify-react";
type Tab = "Enrollment" | "Verification" | "Compare" | "JSON" | "Privacy";
export function App() {
  const [tab, setTab] = useState<Tab>("Enrollment"); const [embedding, setEmbedding] = useState<number[]>(); const [json, setJson] = useState<unknown>(); const [left,setLeft]=useState(""); const [right,setRight]=useState("");
  const tabs: Tab[] = ["Enrollment","Verification","Compare","JSON","Privacy"];
  return <main><header><p className="eyebrow">Browser-only biometrics toolkit</p><h1>FaceVerify Studio</h1><p>Images and vectors stay in this browser unless you explicitly copy or download them.</p></header><nav aria-label="Demo sections">{tabs.map((item)=><button className={tab===item?"active":""} key={item} onClick={()=>setTab(item)}>{item}</button>)}</nav>
    {tab==="Enrollment"&&<FaceVerificationStudio mode="enrollment" onEnrollmentComplete={(result)=>{setEmbedding(result.embedding.vector);setJson(result)}} />}
    {tab==="Verification"&&<><label>Reference embedding JSON<textarea value={embedding?JSON.stringify(embedding):""} onChange={(e)=>{try{const parsed=JSON.parse(e.target.value) as number[];setEmbedding(parsed)}catch{setEmbedding(undefined)}}} /></label><FaceVerificationStudio mode="verification" {...(embedding ? { referenceEmbedding: embedding } : {})} onVerificationComplete={setJson}/></>}
    {tab==="Compare"&&<section className="compare"><h2>Direct vector comparison</h2><textarea aria-label="Reference vector" placeholder="[0.1, 0.2]" value={left} onChange={e=>setLeft(e.target.value)}/><textarea aria-label="Probe vector" placeholder="[0.1, 0.2]" value={right} onChange={e=>setRight(e.target.value)}/><button onClick={()=>{try{setJson(compareFaceEmbeddings(JSON.parse(left),JSON.parse(right)))}catch(error){setJson({error:String(error)})}}}>Compare vectors</button></section>}
    {tab==="JSON"&&(json?<JsonViewer value={json}/>:<p>No result yet.</p>)}
    {tab==="Privacy"&&<article><h2>Your biometric data</h2><p>FaceVerify performs processing locally. It does not upload or persist images, landmarks, or embeddings. Your application remains responsible for consent, secure storage, access control, retention, and deletion.</p><p>Similarity is not liveness detection or legal identity proof.</p></article>}
  </main>;
}
