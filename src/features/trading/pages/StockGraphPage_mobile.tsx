import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Volume2,
  Target,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { mockStocks } from "../data/mockStocks";
import { Stock } from "../types/types";

const StockGraphPage = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [stock, setStock] = useState<Stock | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("5min");
  const [chartType, setChartType] = useState<"line" | "candlestick" | "histogram">("line");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev / 1.2, 0.8));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  // Load stock data
  useEffect(() => {
    const foundStock = mockStocks.find((s) => s.symbol === symbol);
    if (foundStock) {
      setStock(foundStock);
    } else {
      navigate("/");
    }
  }, [symbol, navigate]);

  // Reset zoom when timeframe or chart type changes
  useEffect(() => {
    handleResetZoom();
  }, [selectedTimeframe, chartType]);

  // Keyboard shortcuts and touch gestures
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        handleResetZoom();
      }
    };

    let touchStartDistance = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        touchStartDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        if (touchStartDistance > 0) {
          const scale = currentDistance / touchStartDistance;
          if (scale > 1.1) {
            handleZoomIn();
            touchStartDistance = currentDistance;
          } else if (scale < 0.9) {
            handleZoomOut();
            touchStartDistance = currentDistance;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // Real-time data updates
  useEffect(() => {
    if (!stock) return;

    const interval = setInterval(() => {
      const priceChange = (Math.random() - 0.5) * (stock.price * 0.001);
      const newPrice = Math.max(0, stock.price + priceChange);
      const newChange = newPrice - stock.price;
      const newChangePercent = (newChange / stock.price) * 100;

      setStock(prev => prev ? {
        ...prev,
        price: newPrice,
        change: newChange,
        changePercent: newChangePercent
      } : null);
    }, 2000);

    return () => clearInterval(interval);
  }, [stock?.symbol]);

  // Generate chart data
  const generateChartData = (timeframe: string, currentPrice: number) => {
    const dataPoints: { [key: string]: number } = {
      "1min": 60, "2min": 120, "5min": 300, "10min": 600, "15min": 900, "30min": 1800,
      "1H": 60, "2H": 120, "4H": 240, "1D": 24, "3D": 72, "1W": 7, "2W": 14,
      "1M": 30, "3M": 90, "6M": 180, "1Y": 365, "2Y": 730, "5Y": 1825, "MAX": 3650,
    };

    const points = dataPoints[timeframe] || 24;
    const data = [];
    let price = currentPrice * 0.95;

    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.5) * (currentPrice * 0.02);
      price += change;
      
      if (price < currentPrice * 0.8) price = currentPrice * 0.8;
      if (price > currentPrice * 1.2) price = currentPrice * 1.2;

      const high = price + Math.random() * (currentPrice * 0.01);
      const low = price - Math.random() * (currentPrice * 0.01);
      const openPrice: number = i === 0 ? price : data[i - 1].close;
      const close = price;
      const volume = Math.random() * 1000000 + 500000;

      data.push({
        time: i,
        open: openPrice,
        high,
        low,
        close,
        volume,
        price,
      });
    }

    if (data.length > 0) {
      data[data.length - 1].close = currentPrice;
      data[data.length - 1].price = currentPrice;
    }

    return data;
  };

  interface ChartDataPoint {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    price: number;
  }

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    if (!stock) return;
    
    try {
      const newChartData = generateChartData(selectedTimeframe, stock.price);
      setChartData(newChartData);
    } catch (error) {
      console.error("Error generating chart data:", error);
      setChartData([]);
    }
  }, [stock?.symbol, selectedTimeframe]);

  useEffect(() => {
    if (!stock || chartData.length === 0) return;

    const interval = setInterval(() => {
      setChartData(prevData => {
        if (prevData.length === 0) return prevData;
        
        const lastPoint = prevData[prevData.length - 1];
        const priceChange = (Math.random() - 0.5) * (stock.price * 0.002);
        const newPrice = Math.max(0, lastPoint.close + priceChange);
        
        const high = Math.max(lastPoint.high, newPrice + Math.random() * (stock.price * 0.001));
        const low = Math.min(lastPoint.low, newPrice - Math.random() * (stock.price * 0.001));
        const volume = lastPoint.volume + aphPage;t StockGrdefaulort ;
};

exp</div>
  )   /div>
  <
        </div>     v>
      </di</div>
           >
     an</sp">LIVE font-mediumext-whitetext-xs te="lassNam     <span c      
   "></div>te-pulseanimaounded-full en-500 r-1.5 bg-gre hw-1.5Name="div class    <         10">
 r-white/bordeder py-1 borl px-2 ed-fullur-sm roundp-bro/20 backd-blackspace-x-1 bg-center lex itemse="fdiv classNam      <  en">
    ddnone md:hints-pointer-eve2 p-16 right-bsolute tosName="a  <div clas/}
        r - Mobile * IndicatoLive        {/* 
  
/div>          <   </div>
        
 an>m">LIVE</spdiufont-met-white texs -xsName="textn clas <spa          div>
   se"></te-pulfull animaounded-n-500 reeh-2 bg-grame="w-2 ssN cla  <div     >
       white/10"er-rd boy-1 border-full px-3 pedlur-sm roundp-b20 backdrobg-black/2 pace-x-nter slex items-ceme="f classNa     <div      :block">
 den md-none hidventsnter-ete-y-1/2 poiansla-tr2 nslate-x-1/orm -tratransf/2 p-1/2 left-1solute toassName="ab    <div cl      esktop */}
r - Dive Indicato       {/* L

   /div>      <tton>
    bu       </ />
     "h-4 w-4"e=Namclass<Target                        >
e"
   hit text-wr-white/10rdeer bo-200 bordall duration transition-m rounded-xllur-sp-b0 backdro-black/320 hover:bgg-black/ame="p-2 bassN cl          
   en)}resFullscn(!ieeIsFullscr() => setk={ic onCl             
   <button

         v>       </din>
       </butto            " />
"h-4 w-4className=ateCcw Rot     <            >
                 }`}
       "
     hiteext-wg-white/20 t:b"hover: wed" -not-allosor0 cur"opacity-5l === 1 ? Leve        zoom          -200 ${
 durationsition-allranounded-lg tp-2 rssName={`       cla}
         evel === 1d={zoomL  disable          tZoom}
    leReseck={hand   onCli             tton
      <bu      
  ton>but</            " />
  w-44 e="h-mIn classNamoo  <Z   
              >       
    }}`               e"
 -whit text/20er:bg-white: "hov" wedalloor-not-0 curs"opacity-5? Level >= 3      zoom  
           -200 ${l durationnsition-al-lg traed`p-2 roundme={ classNa              = 3}
 Level >bled={zoom      disa
          In}leZoomClick={hand  on             
 onbutt    <            </div>
        
    l * 100)}%mLeveund(zoo.roath{M             
   te/20">der-whier bord-lg bordde10 rounbg-white/enter -ctext] 0pxn-w-[5-white midium textt-xs font-me texpy-1Name="px-3  class       <div
       n>to       </but   " />
    h-4 w-4ssName="ut claZoomO          <
        >          }`}
              "
    ext-white-white/20 tover:bg"hllowed" : r-not-aty-50 cursoci "opa0.8 ?<= mLevel      zoo           
  ion-200 ${ duratsition-allded-lg tran{`p-2 roun className=            <= 0.8}
   mLevel bled={zooisa d           
    dleZoomOut}anlick={honC                
    <button        /10">
  der-whiteder bor1 borounded-xl p-m rdrop-blur-s/20 backackbg-blx-1 enter space-items-cex ="flName <div class           to">
er-events-au point-x-3enter spacetems-cx ilehidden md:f4 om-4 right-ute bottame="absol classN  <div      
  Controls */} - Zoom  Right BottomDesktop{/*       
    
div>   </v>
               </di)}
       )  >
         on/butt   <       an>
      label}</spine">{idden sm:inlme="hNaclass   <span             
   4 w-4" />ssName="h-con cla<I                 >
            bel}
     e={la        titl          }`}
            "
      -white/10r:bgovewhite her:text-te/70 hovhi "text-w      :         "
       hite/20-wborder-sm border hadowhite sext-w/20 t-white      ? "bg        pe
         ty==rtType =       cha     
         ${ration-200n-all du transitiodiumm font-med-lg text-s-2 rounde pyce-x-1 px-3 spa-centerlex itemsme={`fssNala           c      
 istogram")}tick" | "hles" | "cande as "linetType(typ=> setChar={()  onClick                pe}
 ={ty  key           tton
         <bu            }) => (
Icon l, icon: abetype, l].map(({            e2 },
   lum icon: VoVolume",", label: ""histogram type:           {,
      rt3 }on: BarChaandle", ic"Cabel:  ltick",dles type: "can         {      ty },
 con: Activiine", i: "Le", label: "linpe ty      {           {[
             0">
/1tewhider border-1 bornded-xl p-lur-sm rouop-backdrk/20 b-blac-x-1 bgflex spacesName="<div clas  
          
/div>  <
          s-none" />entevter- poin/70t-white h-4 w-4 texnslate-y-1/2 -traansform/2 tr-3 top-1ghtolute riName="absown classevronDCh         <
       </select>            ptgroup>
  </o              
ion>ime</optll T"MAX">Avalue=<option             >
      ptionars</oYeY">5 "5lue=tion va  <op           >
     tionYears</op="2Y">2 valuetion <op                 option>
 Year</">1 1Yue=" valtionop         <      ion>
   onths</optM">6 Mon value="6pti   <o          
     option>">3 Months</e="3M<option valu                  h</option>
Mont>1 1M"lue="n vaio<opt           
        Years">ths &el="Monup lab<optgro                >
upro     </optg      
     </option>eks2 We">value="2W<option            on>
       k</opti1 Weee="1W">lun va    <optio      n>
        s</optioDay="3D">3 ueal<option v             on>
     1 Day</opti"1D">value=option         <       ays">
   label="Dptgroup         <op>
        </optgrou           on>
     urs</opti"4H">4 Hoalue=tion v      <op            ion>
/opt Hours<>22H"value="n ptio          <o       option>
  Hour</lue="1H">1<option va                  >
="Hours"p label    <optgrou      
      roup>tg </op            option>
   0 Minutes</"30min">3value= <option             n>
     </optio5 Minutes">15min"1tion value=         <op     ion>
    pts</o">10 Minute="10minion valueopt          <n>
        /optio Minutes<"5min">5n value=tio  <op         
       ion>nutes</opt2 Mi"2min">value= <option         
         e</option>ut">1 Minlue="1min <option va                s">
 bel="Minutegroup la<opt                  >
            
]"min-w-[120pxck/30 lar:bg-bointer hove0 cursor-puration-20sition-all dt trantransparenr-ordecus:bfong-blue-500 -2 focus:ri focus:ringite-whextum tmedit-sm font-10 texx-4 py-2 pr-d-xl pndete/10 rouder-whiborder bor-sm lurackdrop-bck/20 b bg-blace-none"appearan=  className        )}
      .valuee(e.targetdTimeframsetSelectee) => nge={(Cha       on
         frame}tedTimeselecvalue={            ct
    sele      <       
 ative">ssName="rel<div cla  
          ts-auto">evenr- pointe space-x-3ters-cenemd:flex itdden m4 left-4 hittom-lute boName="absoclass    <div     rols */}
   Bottom Contop   {/* Deskt   

    </div>            </div>
              </div>

          /div>      <
           </button>               " />
  "h-4 w-4me=lassNa<RotateCcw c              
            >               }`}
            "
     t-whitetex0 -white/2:bg : "hoverd"llower-not-acurso0 city-51 ? "opa==  =   zoomLevel              
     on-200 ${ratiall duion- transitd-md rounde`p-2Name={  class          }
        el === 1d={zoomLev     disable            }
   tZoomesedleRonClick={han            
        button           <       >
 </button               -4" />
  "h-4 wame=omIn classN      <Zo                  >
         }`}
                    e"
     0 text-whitte/2over:bg-whi" : "hwed-allonoty-50 cursor-? "opacitl >= 3 evezoomL                    ${
   uration-200l dansition-ald trrounded-mName={`p-2 class                   
 = 3}l >veLebled={zoomisa          d        eZoomIn}
  ={handl  onClick                 <button
             iv>
               </d      0)}%
   l * 10mLeve.round(zoo       {Math             0">
te/2order-whid border b10 roundeg-white/ b-centerpx] text-[40white min-w text-ums font-meditext-x-2 py-1 Name="pxlass<div c              
    tton>  </bu              
   w-4" />e="h-4assNammOut cl       <Zoo            >
               }`}
               
         " text-whiteite/20ver:bg-whhod" : "lowe-alrsor-not cu-50opacity 0.8 ? "l <=Leve  zoom                0 ${
    ion-20 duratallion-sitmd trannded-roup-2 lassName={`    c              0.8}
  Level <= ={zoomled   disab              mOut}
   eZoock={handlCli     on             button
   <           >
      r-white/10"borde border ed-lg p-1round-blur-sm 20 backdropblack/-x-1 bg-r spacems-centee="flex itesNamdiv clas        <       
    </div>
           
         ))}           ton>
   </but             />
     "h-4 w-4"lassName=Icon c        <      
             >               {label}
  title=                    }`}
                      /10"
:bg-white-white hoverer:text hove/70xt-whit "te :                    
     0"ite/2er-whorder bord bhadow-smite sext-whhite/20 t? "bg-w                      pe
    = tyhartType ==      c              ${
     00ion-2duratition-all um transsm font-medided-md text--2 rouny-center pnter justiftems-ceme={`flex ilassNa   c                   togram")}
"hisstick" | "candleine" | "le as rtType(typ> setCha =={()Click  on                    ey={type}
     k              ton
          <but      (
       con }) =>  icon: Ilabel,pe, ({ ty].map(            
      2 },ume", icon: Vololume, label: "Vam"gr "histo    { type:            ,
     BarChart3 }le", icon:abel: "Cand", lickandlest type: "c  {                 y },
 Activite", icon: el: "Linlabine", "l: type  {                 
  [    {            ">
  der-white/10border borp-1 unded-lg -blur-sm rokdropblack/20 bac-x-1 bg-pacee="flex sNam  <div class             ce-x-2">
 tween spa justify-beenterex items-cassName="fl   <div cl         

     </div>           
one" />events-n/70 pointer--whitetext-4 h-4 w1/2 ate-y- -transl/2 transformop-1 right-3 tte"absoluassName=nDown cl    <Chevro           t>
 lec  </se             
 up></optgro            
      tion>">1 Year</op"1Yion value=     <opt            option>
   ">3 Months</="3Mption value  <o           on>
        Month</optilue="1M">1va    <option           
      >"Monthsoup label="ptgr     <o       
      /optgroup>      <            ion>
/optW">1 Week<on value="1opti <          
         tion>y</op Da1D">1e="valuoption          <           s">
label="Dayup ptgro         <o   >
      optgroup         </       option>
  Hours</"4H">4 ion value=   <opt                >
 our</option">1 H1Halue="  <option v          
        ="Hours">bel<optgroup la                >
  tgroup  </op               ion>
 </opt Minutes0min">30"3value=n     <optio           >
     tes</option15 Minu">alue="15mintion v <op             
      /option>nutes<5 Mi="5min">on value    <opti               
 n>inute</option">1 Me="1mi<option valu                 
   ">esabel="Minuttgroup l        <op
                >
          -black/30"er:bginter hov00 cursor-pon-2all duratioansition-sparent trer-tran:borde-500 focus-blufocus:ring-2 ocus:ringwhite fxt-tent-medium 0 text-sm fo-3 pr-1x-4 pyounded-lg p/10 rwhite border-er bordop-blur-smdrck/20 back-blanone bge-ncfull appearame="w-classNa               ue)}
   et.valame(e.targefrSelectedTim=> setChange={(e)           on  e}
      eframelectedTimvalue={s               
   select   <             lative">
ssName="reiv cla       <d    -3">
   -y0 spaceer-white/1order borded-xl p-3 b-sm rounddrop-blurck/30 backe="bg-bladiv classNam  <          z-10">
den -auto md:hidents pointer-evft-2 right-2-2 leolute bottom="abs className       <div   */}
 Controlsle Bottom    {/* Mobi
       iv>
      </d  >
  </div        v>
        </di
          </div>              
  n>    </spa           d(2)}%
   ent.toFixePercock.change}{st: ""e ? "+" {isPositiv                  }`}>
                 "
   red-500/30border-00 border 0 text-red-400/2red-5  : "bg-               
      00/30"green-5 border-400 border-green-0/20 textreen-50  ? "bg-g                   
  isPositive                 ${
   -medium ext-sm fontlg tnded-y-1 roux-2 pName={`p <span class         >
          </span            d(2)}
    hange.toFixe₹{stock.c+" : ""}ositive ? "  {isP                 >
 -400"}`}"text-red0" : en-40"text-gre ? sPositivesemibold ${ie={`font-assNam cl     <span              )}
            " />
     d-400text-re-4 ="h-4 wlassNameown cngDndi        <Tre               ) : (
               " />
400en-re4 text-gh-4 w-ssName="endingUp cla    <Tr               ve ? (
 isPositi       {      ">
     ce-x-2 mt-1ify-end spajustcenter ms-x iteleassName="fcl       <div        
  div>       </         })}
Digits: 2 actionmumFr", { miniring("en-INe.toLocaleSt₹{stock.pric                  e">
text-whitt-bold text-2xl fon="ssName   <div cla    >
         "t-rightsName="texiv clas  <d       ">
     e/10r-whitrder bodex-4 py-3 bored-xl pm roundrop-blur-s backdbg-black/20className="div         <   
 uto z-10">er-events-antmd:block poien 4 hiddght-top-4 rilute ame="absov classN       <di
   Info */}ce ight - Pritop Top Rsk      {/* De   </div>

       
    div>      </
      >/div         <   </div>
           
       </p>k.name}">{stoc200px] max-w-[00 truncateext-gray-3-xs t="textssName    <p cla         
     ymbol}</h1>.sockite">{stbold text-whxt-lg font-ame="te classN     <h1      iv>
       <d             v>
       </di      >
      span, 2)}</bol.slice(0>{stock.symext-xs"ld tnt-bote fo"text-whi className=an    <sp             nter">
 fy-ce justiitems-centered-lg flex nd-600 routo-purple0 om-blue-50br fradient-to--gr bg8 h-8"w-assName=   <div cl          ">
   e-x-3r spacntetems-ceex iame="flsNiv clas  <d            ">
te/10border-whir de4 py-2 borx-l psm rounded-xrop-blur- backd/20ackg-blme="bclassNa      <div on>
           </butt       " />
ext-white w-5 th-5me="t classNaArrowLef <                    >
     "
hite/10r-wordeer bn-200 borduratioon-all dl transitinded-xm rou-surkdrop-blblack/40 bacg-er:bck/20 hovbg-bla"p-2 lassName=    c
          symbol}`)}ock/${/stgate(`avick={() => n  onCli             <button
          >
 to z-10"nts-au pointer-eveace-x-3-center spex items md:fl hidden4 left-4ute top-"absolassName=   <div cl     */}
  s ontroltop Top C/* Desk  {      v>

  </di            </div>
    
          </div>        >
         </div
         v>     </di            
   </span>                d(2)}%
  t.toFixengePercenock.chast"}{" : ""+e ? sitivsPo   {i                }`}>
                    "
   0/3d-500border-rer rde400 boxt-red-ed-500/20 tebg-r    : "           
         00/30" een-5er border-grn-400 bord0 text-green-500/2g-gree"b?                      sitive 
    isPo                  ium ${
   medt-text-xs fon0.5 rounded {`px-1 py-assName=   <span cl               
  pan>  </s          }
        toFixed(2)e.tock.chang ""}₹{se ? "+" :iv  {isPosit                   `}>
 t-red-400"}ex400" : "tn-eeext-gr "tPositive ?ibold ${isemfont-s`text-xs me={ classNapan   <s            
          )}       />
        " xt-red-4003 w-3 tee="h-Namwn classDo <Trending                  : (
            )           0" />
 reen-40-3 text-g3 wsName="h-ingUp clasrend   <T              
     ive ? (sit{isPo                x-1">
    space-nd r justify-eitems-centeName="flex   <div class           
     v>     </di          })}
   2 onDigits: inimumFracti, { mIN""en-ring(oLocaleStck.price.tsto    ₹{          ">
      etext-whitbold xt-lg font-me="teclassNav   <di              ">
  -rightName="textiv class  <d           /div>
          <         </div>
               
   bol}</h1>.sym{stockext-white">ont-bold text-sm f="tamesN  <h1 clas                div>
         </        span>
     )}</, 2ce(0slibol.>{stock.symtext-xs" font-bold hite"text-wclassName=   <span                   ter">
 -cenfyr justiitems-cente flex  rounded-md-600to-purple00 ue-5om-blo-br fr-gradient-t"w-6 h-6 bgme=lassNa    <div c               >
  space-x-2"ms-centerflex itelassName="iv c  <d              button>
            </    e" />
     text-whit w-4"h-4t className=  <ArrowLef                         >
           10"
rder-white/order boon-200 batiion-all durd-lg transitsm roundeblur-40 backdrop-ack/ hover:bg-bl bg-black/20-2ssName="p   cla                 l}`)}
ymbo`/stock/${sigate(() => navnClick={    o             n
   tout    <b          ">
    2er space-x-s-cent iteme="flexamiv classN <d         n">
      twee justify-betems-centerx iName="flelassiv c    <d         ite/10">
 er-whrder bordxl p-3 bo rounded--blur-smackdropck/30 bme="bg-blaNalassiv c <d          ">
 dden z-10to md:hi-events-auinter2 right-2 pot-lefolute top-2 Name="abslass <div c}
         Top Bar */le obi       {/* M  
 e">r-events-nonet-0 pointee ins"absolut className=      <div*/}
  s Overlay rolCont      {/* 

  div>     </t()}
   enderChar      {r
    0 md:pb-0">-32 md:pt-00 pt-20 pb0 to-slate-9-slate-800 viaslate-90o-br from-ient-t-0 bg-gradinsetsolute "abame=classN       <div  */}
 pacingith proper s container wrtha   {/* C">
     ve-1 relatiexassName="flv cl>
      <din"w-hiddeflooverl x-co fleflex0  bg-slate-90xed inset-0ame="fiv classN <di  rn (
 

  retu
  };
    }a} />;{chartDatta=art daChine return <L     
  ault:ef;
      d />ta}artDaart data={chamChogrurn <Hist  ret
      ogram":e "hist    casta} />;
  {chartDahart data=stickCandlereturn <C    ":
    andlestick    case "cype) {
  chartT   switch (

  );
    }iv>
           </d
   </div>      >
   ailable</prt data avo cha">N400y-ark:text-gra00 dray-5"text-ge=Nam <p class         
  2">📊</div>0 mb--gray-40"textassName= cliv       <d     ">
entere="text-c classNam        <div>
  r h-full"centeustify-s-center jtemex i"flv className=<di (
        rn retu{
     ) = 0ngth ==.leata| chartDhartData |    if (!c) => {
derChart = (const ren };

   );
 
        </div>  </div>
     ed(1)}M
  00).toFixlume / 10000x: {(maxVo  Ma">
        /10rder-whiteorder bounded b py-1 ro-sm px-2rop-blurck/20 backdg-blate bs text-whift-4 text-xte top-4 lebsoluName="av class <di*/}
       bels Volume la  {/*    vg>

         </s </g>
       
          </g>}
         })
              );         />
                      r"
sor-pointecity curnsition-opacity-100 trall-opa"hover:fime=     classNa           8"
    0.Opacity=" fill              4"}
     #ef444: "0b981"  "#1Green ?={is        fill        }
    ightarHe  height={b                Width}
  ={bar      width              t}
rHeightHeight - baar chtop +argin.y={m            
        idth / 2} barW    x={x -         }
       ey={index       k            ect
    <r         (
       return                ;

ice)| point.pr.price |[index - 1]? >= (datant.pricee : poi= 0 ? tru==dex  inn =const isGree             ight;
   e) * chartHexVolumlume / maint.voight = (ponst barHe  co        ;
       2))vel,(zoomLeth.min.8 * Magth) * 0ta.lenWidth / dartax(1, (cha.m= MatharWidth    const b         ;
    rtWidthha)) * cth - 1data.length.max(1, Ma+ (index / in.left t x = marg cons               > {
t, index) =((pointa.map         {das */}
     Volume bar* {/           }}>
   }px` Height/2arttop + ch ${margin.}pxtWidth/2 + charin.leftin: `${margrig{ transformO)`} style={zoomLevel}e(${cal{`sform= trans   <g  ">
       Clip)ogramst"url(#hig clipPath=       <
   */}nt  chart conte{/* Zoomable       

     </text>
             Volume
       
          >"25), 2 150,="rotate(-9sform      tran   "bold"
   eight= fontW           "
or="middlextAnchte       "
     ="11ize    fontS    "
    ll="white       fi225"
          y="   "15"
             x=<text
          </text>
       e})
      Timeframctede ({sele       Tim    >
         old"
  Weight="b       fontdle"
     nchor="mid      textA
      e="11"    fontSiz
        "white"  fill=     }
     {440 y=           }
     x={450xt
         <te/}
        les *is tit      {/* Ax)}

        }  );
               text>
           </el}
    meLab    {ti                >
     le"
     iddAnchor="m    text           ="9"
   fontSize            
  "white    fill="            + 15}
artHeight n.top + chrgi      y={ma        }
  tWidth / 6)+ i * (char.left  x={margin       `}
        bel-${i}  key={`x-la          text
              <n (
       retur         meIndex}`;
${ti}m` : `${timeIndex"M") ? `des(me.inclumefradTielecte           s          :
       ndex}w` `${timeIs("W") ? ludeframe.incselectedTime                       }d` :
     Index `${timeD") ?"ludes(incame.imefr selectedT                       h` :
    eIndex}{tim`$") ? "Hdes(ncluTimeframe.i  selected                         ndex}m` :
 `${timeI") ? ludes("minme.incedTimefralect seabel =nst timeL     co    
   (i / 6)); 1) * h -gtlenoor((data.ex = Math.flndst timeI       con
      => {(i).map(0, 2, 4, 6]       {[  /}
 abels ** X-axis l     {/
     
}     })  ;
        )t>
       tex</        )}M
      (100).toFixedme / 10000(volu       {>
                     middle"
  ne="ntBaselimina     do     "
      ="endorch      textAn        
  ="9"ntSize   fo            white"
     fill="             4)}
ight /* (chartHe + i op={margin.t   y            - 5}
 left ={margin.  x        }`}
      label-${i    key={`y-              <text
            (
n     retur4;
        i)) / (4 - axVolume *  = (mst volume  con
          p((i) => {, 4].ma 30, 1, 2,     {[/}
     labels *s axi{/* Y-         
 >
    /"
      "1eWidth=       strok     te"
roke="whi   st
         ht}igartHetop + ch={margin.y2           h}
 idt+ chartWmargin.left        x2={
     tHeight}ar+ chop ={margin.t      y1  ft}
    gin.le   x1={mar         e
   <lin>
        /
         "okeWidth="1         strte"
   stroke="whi     }
       ght chartHeiin.top +y2={marg            n.left}
{margix2=         in.top}
   ={margy1          ft}
  in.le  x1={marg
          <line    
      */} Axes {/*             ))}

          />

         dth="0.5"    strokeWi
          y="0.08"rokeOpacit  st     e"
       ="whit      stroke)}
        / 4ight hartHe+ i * (ctop {margin.y2=      }
        chartWidth.left + gin{mar2=     x
         ht / 4)}(chartHeigi * rgin.top + ma y1={        
     argin.left}     x1={m      `}
   {`h-${i}   key=         <line
             (
  ) =>ap((i 4].m 3,{[0, 1, 2,    }
      rid lines */{/* G
                />
0.5"
    th="eWid strok           
,0.2)"5,2555,25="rgba(25roke st
           ,0,0,0.1)"ll="rgba(0fi          t}
  chartHeigh height={          artWidth}
 ={ch       widthtop}
     in.arg y={m          gin.left}
      x={mar
       ect  <r
        nd */}roua backgare* Chart         {/
  
fs>/de     <th>
     Pa      </clipt}/>
      chartHeight={heighidth} {chartWwidth=rgin.top} } y={maargin.left x={m     <rect   ">
      gramCliphistoid="<clipPath         >
           <defs>
   0 900 450""0 " viewBox=l h-full="w-fulName <svg class       hidden">
l overflow-w-full h-ful="relative ame <div classNn (
     retur  om;

  bott - margin.in.top450 - margt = artHeighonst ch   cn.right;
 t - margigin.lef marth = 900 -idt chartW  cons;
  ktop.desrtMargins: cha.mobile chartMargins8 ? erWidth < 76nn.idowwinargin = const mme));
    olu((d) => d.vta.mapmax(...daume = Math.xVol    const ma
v>
    );
/diilable<a ava50">No datite/text-whfull fy-center h-er justiems-cent"flex itame=classN     <div 
 n (h) returgt (!data.len
    if[] }) => {aPoint ChartDatta:data }: { daart = ({ gramChtois  const H

};;
   )      </div>
  g>
       </sv
  /g> <
         g>     </}
              }) );
                       </g>
                 />
                  r"
  rsor-pointey cupacition-otransit0 pacity-10fill-ohover:ssName="    cla                 5}
 h={0.Widt    stroke                  4"}
: "#ef444"#10b981"  ? {isGreenroke=  st                  
  0.9 : 1}een ? isGrOpacity={     fill             "}
    ef444481" : "##10b9een ? "fill={isGr                      ht}
ht={bodyHeig       heig          dth}
     andleWi    width={c               dyTop}
        y={bo               2}
  th /  - candleWid      x={x            t
           <rec            1}/>
 rokeWidth={4444"} st "#ef" :10b981 ? "#oke={isGreen{lowY} str={x} y2=hY} x2} y1={higne x1={x   <li             x}>
    nde key={i        <g         
 n (      retur          ;

eY - openY))ath.abs(closax(1, Math.meight = MyHbod   const          );
    penY, closeYn(o = Math.minst bodyTop      co        nt.open;
   >= poiint.close = posGreen  const i        

      * yScale;Price) ow - min - (point.l baseYst lowY =  con      e;
         yScal *e) minPricoint.high - - (p = baseYst highY   con        ale;
     ySc * minPrice)lose -  (point.cY -= baseoseY const cl                Scale;
) * yPricet.open - min (poin = baseY -st openY       con     ;

    eightartH chp +.togin baseY = mar      const     
     ceRange;t / priHeigh= chart yScale    const     );
        mLevel, 2))oo* Math.min(z* 0.8 th) .length / data(chartWidth.min(15, MaMath.max(2, = idth dleW const can            
   h;hartWidt- 1)) * c.length x(1, dataMath.ma(index / in.left +  margonst x =   c      > {
       index) =((point,    {data.map         icks */}
  {/* Candlest       }>
       /2}px` }chartHeighttop +  ${margin.Width/2}pxart.left + ch `${marginOrigin:ransform style={{ tel})`}oomLevcale(${zform={`s   <g trans
         ">p)eCli(#candl"urlath=g clipP   <
        */}art content ch* Zoomable          {/</text>

        (₹)
         Price
         >     
  5)"90, 15, 22"rotate(-sform=     tran"
       eight="bold   fontW    
     middle""chor=textAn            "11"
ontSize=     f
       ll="white"  fi     25"
       y="2    "
      x="15         <text
    
             </text>)
      e}eframdTimecte({selime       T             >
"
   "bold=ightWe        font  dle"
  or="midAnch        text1"
    "1tSize=    fon  
      ite"="wh     fill0}
        y={44            x={450}
          <text
   /}
         * titlesxis* A  {/
        )}
     }
     ;     )
       /text>        <
      bel}eLa{tim              >
       
         "="middlextAnchor          te
      "9"  fontSize=    
          hite"    fill="w            ght + 15}
artHeip + chin.toy={marg           )}
     tWidth / 6 + i * (char{margin.left      x=     `}
     i}-${elx-lab  key={`           
     <text          rn (
     retu;
         eIndex}`${tim : `ex}m`meInd`${ties("M") ? ludeframe.incselectedTim                      
       :meIndex}w`{ti? `$) ludes("W"ame.inctedTimefr selec                     :
      meIndex}d` ") ? `${ti("D.includestedTimeframe       selec           
          ` :}h{timeIndex `$("H") ?includesame.Timefr selected                        :
    dex}m`timeIn) ? `${"min"cludes(rame.inTimefctedseletimeLabel =       const 6));
      - 1) * (i / data.length floor((= Math.timeIndex onst           c{
  .map((i) => [0, 2, 4, 6]          {s */}
-axis label    {/* X    }

         })
             );
  xt>      </te       d(0)}
 ce.toFixe₹{pri            >
                dle"
  ="midineaselantB       domin         ="end"
tAnchor       tex         ze="9"
fontSi               
 l="white"      fil         4)}
  artHeight /chtop + i * ({margin.       y=    5}
      .left -margin  x={      }
        abel-${i}`-lkey={`y            
        <text          eturn (
        r) / 4;
    * (4 - i)nge eRarice + (price = minPpric   const      {
     (i) =>, 3, 4].map(, 1, 2  {[0       }
 bels */axis la  {/* Y-     

             />h="1"
strokeWidt          te"
  ="whistroke          ht}
   chartHeigtop +y2={margin.           dth}
 tWileft + char x2={margin.           ht}
ig chartHen.top +  y1={margi        n.left}
    x1={margi     e
     in<l              />
 1"
     dth="strokeWi      te"
      e="whiok    str        rtHeight}
p + cha.torgin2={ma     y      
 argin.left}={m          x2op}
  ={margin.t          y1.left}
  in{marg x1=         
    <line      xes */}
  /* A          {

       ))}/>
           .5"
    "0rokeWidth=    st      .08"
    "0Opacity=   stroke           "white"
e= strok    }
         ghteiartHp + ch2={margin.to    y        / 6)}
  th (chartWidt + i * in.lef x2={marg        top}
     y1={margin.             dth / 6)}
  (chartWi+ i *eft ={margin.l         x1     ${i}`}
v-y={`      ke     e
       <lin
         (ap((i) => 6].m 3, 4, 5, 1, 2,       {[0,))}
               />
        
  "0.5"okeWidth=     str
         8"ity="0.0rokeOpac       st      
 "tee="whitrok         s     t / 4)}
ighi * (chartHein.top + {marg     y2=         idth}
+ chartWin.left    x2={marg          
 4)}Height / i * (chart.top + marginy1={            }
  argin.leftx1={m      }
        ey={`h-${i}`           k   <line
          => (
  ].map((i) , 1, 2, 3, 4     {[0  
    */} lines    {/* Grid

             />"
   idth="0.5trokeW      s
      "255,255,0.2)5,ke="rgba(25        stro
    ,0,0.1)"ba(0,0="rg     fill       ght}
hartHei{cight=he         th}
   {chartWid    width=   top}
      y={margin.     ft}
      rgin.lex={ma     ct
        <re      und */}
   ckgroarea bahart /* C    {
      efs>
</d       pPath>
       </cli      ht}/>
  t={chartHeig} heighrtWidthwidth={chain.top} y={marg.left} arginrect x={m <          
   >lip"dleC="canPath id      <clipefs>
       <d
         00 450">Box="0 0 9" viewfullull h-sName="w-f  <svg clas      hidden">
l overflow-ull h-fultive w-f="relameassNa   <div cl(
   
    return om;
margin.bottgin.top -  = 450 - mar chartHeightnst
    cogin.right;eft - marin.largh = 900 - mhartWidtst cp;
    conns.desktohartMargis.mobile : cargin8 ? chartMrWidth < 76window.inne=  margin nst
    coe || 1;
ce - minPricmaxPrie = ceRang   const pri;
  d.high))=>ap((d) ax(...data.mce = Math.mri const maxP
   );d.low).map((d) => (...dataath.mininPrice = M mnst

    co );v>
   ilable</dia ava">No datxt-white/50ll te-center h-funter justify items-cee="flexiv classNam(
      <durn gth) reta.lenif (!dat     => {
aPoint[] })ChartDat { data: { data }:rt = (ndlestickChat Ca  cons
  };

>
    );div</
          </svg>
          </g>>
       </g        ))}
            
           />
        on-opacity"00 transitier:opacity-1 hov-80pacitylassName="o        c          }
 "#ef4444"981" : ? "#10b{isPositive   fill=                   r={2}
            eight}
  ge) * chartH/ priceRan minPrice) e -point.pricHeight - ((chartn.top + margi    cy={             
 artWidth} 1)) * cha.length -x / (dat+ (indet {margin.lef       cx=          ={index}
  key            
      <circle               => (
 , index)a.map((pointdat > 2 && omLevel         {zo */}
     Data points{/*        }

                 )   />
           "
      oin="roundokeLinej    str       
       d"ounp="rstrokeLineca            
      {2}eWidth= strok            44"}
     "#ef44 1" :"#10b98tive ? sPosioke={i        str    
      "none"     fill=        }
      ")}`   .join("             ght}`)
    eitH charnge) * priceRaice) /Pr - minoint.priceht - ((peigtop + chartHargin.${mtWidth} ar chh - 1)) *ata.lengt(d (index / in.left +`L ${margx) => indep((point,  .ma                  a
 datt} ${artHeigheRange) * chce) / pricPrie - min0].pricdata[Height - ((op + chart{margin.trgin.left} $d={`M ${ma                     <path
            1 && (
  ength >{data.l             
  */}/* Main line    {      
          )}
       />
              ient)"
   ineGrad"url(#l     fill=         }
    } Z`htHeig+ chartargin.top ${mgin.left} t} L ${marartHeighn.top + chrgi ${maartWidth}n.left + ch} L ${margi" ")n(    .joi               eight}`)
 e) * chartHRang / pricece)e - minPriic ((point.prartHeight -chop + .trginth} ${maidhartW- 1)) * c.length  / (data+ (indexgin.left {marex) => `L $int, ind(pop(   .ma                 a
} ${dat chartHeightRange) * / priceice)e - minPra[0].pricht - ((dat + chartHeiggin.topmar ${rgin.left} ${ma       d={`M     h
             <pat       && (
   .length > 1      {data/}
        er curve *{/* Area und          }}>
    ight/2}px` + chartHeop argin.tpx ${mWidth/2}left + chartin.n: `${margansformOrigi{ tr`} style={omLevel}){`scale(${zoorm= <g transf           p)">
#chartClipPath="url(g cli         < */}
 ntentart co Zoomable ch{/*         /text>

    <      e (₹)
    Pric>
         
          5, 225)"ate(-90, 1m="rotfor    trans      
  ="bold"ght    fontWei     ddle"
   ="mihor textAnc     11"
      fontSize="           ite"
 "wh     fill="
       25y="2          x="15"
              t
 <tex      
   xt>   </te
       rame})lectedTimef   Time ({se
                   >old"
"bt=ontWeigh f         le"
  idd"mAnchor=text    
        11"ntSize="  fo         hite"
 "w   fill=}
               y={44050}
            x={4
       <text         }
*/ titles     {/* Axis      

       })});
             text>
  </            bel}
    {timeLa              >
            "
  dleAnchor="mid        text      "
  ize="9ontS        f"
        ll="white     fi    
        + 15}rtHeightop + cha={margin.t          y 6)}
      idth /hartW(c.left + i * ={margin  x             `}
 label-${i}={`x-        key      text
      <      turn (
           re     x}`;
timeIndedex}m` : `${meIn `${ti"M") ?udes(frame.inclelectedTime        s                  }w` :
  timeIndex? `${") udes("We.inclTimeframedct sele                       :
     dex}d`eIn${tims("D") ? `cludemeframe.in selectedTi                          :
  Index}h`time"H") ? `${e.includes(tedTimeframec       sel                    ex}m` :
 `${timeInd") ? cludes("mineframe.inlectedTimel = seeLabnst tim    co       ));
  6(i /gth - 1) * ((data.lenloorex = Math.ft timeInd    cons        
ap((i) => { 2, 4, 6].m      {[0,}
     labels *//* X-axis   {   

          })}        );
        xt>
   </te          ixed(0)}
 price.toF        ₹{
             >      
   "middle"=elinenantBas   domi            d"
 Anchor="en      text     
     ize="9" fontS              
 white"fill="           / 4)}
     t hartHeighop + i * (cn.t y={margi      
         - 5}n.left argi={m        x    i}`}
    y-label-${y={`  ke         
            <text(
       turn    re
         4 - i)) / 4;eRange * (ce + (pricPri= mine t pricns        co
    ap((i) => {].m 1, 2, 3, 4       {[0,ls */}
   labeaxis * Y-       {/    />

   
      dth="1"trokeWi         s"
   ="whiteroke       stght}
     hartHeiop + c2={margin.t      y   h}
    chartWidtn.left +rgi    x2={ma       
 ight}p + chartHein.to y1={marg
           t}n.lef1={margi          x<line
              />
    "1"
    =idth  strokeW         "
 whiteke="     stro     ht}
   chartHeiggin.top +   y2={mar
         n.left}  x2={margi          top}
{margin.     y1=t}
       gin.lef{marx1=                 <line
  s */}
   {/* Axe         
 }
 ))              />
     0.5"
  ="keWidth       stro"
       ="0.08cityOpa     stroke  "
       hitetroke="w          sht}
     chartHeigop +y2={margin.t              / 6)}
Width  * (chartt + iargin.lef    x2={m  
        }opn.targi   y1={m      / 6)}
     idth  (chartW * + igin.left     x1={mar         {`v-${i}`}
  key=           line
   <    (
      map((i) => , 6]. 5 3, 4,0, 1, 2, {[  }
                 ))       />
0.5"
     idth="  strokeW          0.08"
  "pacity=   strokeO        te"
   roke="whi          st4)}
    ht / artHeig* (ch i op +n.trgi      y2={ma        idth}
eft + chartWin.larg       x2={m       ght / 4)}
(chartHei+ i * .top y1={margin     }
         ftargin.le1={m x             
-${i}`}ey={`h        ke
         <lin
         ((i) => (.map3, 4]2, [0, 1,       {    }
ines */* Grid l{/    

       />
         th="0.5"  strokeWid       
   ,0.2)"255,255,255gba(stroke="r       )"
     0,0.1,0,"rgba(0    fill=     
   eight}hartH{cght=        heiWidth}
    rt  width={cha         
 gin.top} y={mar        n.left}
   rgi  x={ma
            <rect        nd */}
rou backgareahart {/* C    
        </defs>
  h>
       </clipPat    
       ight}/>rtHeha{c height=artWidth}width={chtop} argin.left} y={min.x={marg<rect             p">
  "chartClipPath id=    <cli
        dient>arGra </line          .1"/>
 "0stopOpacity=444"} " : "#ef4#10b981 ? "veor={isPositistopCol"100%" =ffset <stop o             "/>
pacity="0.4opO"} st: "#ef4444#10b981"  "e ?itiv={isPosColortop" set="0%top offs          <s
    ="100%">%" y2 x2="0="0%"1="0%" y1ent" x"lineGradiient id=linearGrad          <defs>
           <>
 "none"pectRatio=Asreserve0 450" p0 90iewBox="0 " vll-full h-fu="wlassName     <svg c>
   idden"verflow-hll h-full o-futive wsName="rela  <div clas   (
   return 

  rgin.bottom;top - mamargin.450 - eight = artHconst ch  ight;
  argin.rft - mrgin.le00 - ma 9Width = chart   const
 ;s.desktoprtMarginchans.mobile : gi8 ? chartMaridth < 76.innerW = windowmargin   const gins
 nsive marpo  // Res| 1;

  e |ic- minPrice = maxPre priceRang    const d.price));
d) => ata.map((...d= Math.max(st maxPrice once));
    cri => d.pap((d)..data.mth.min(.ice = ManPr   const mi
 );
    }
  >
    div  </
      ilablevata a      No da50">
    ite/l text-wh h-fuly-centerenter justifx items-came="fle <div classN (
           return{
  gth) .len !data!data || (
    if }) => {oint[]ataPata: ChartD data }: { d = ({eChartst Lin
  con
  };
0 }, bottom: 60, right: 20 top: 2left: 80,p: {  deskto },
    bottom: 60t: 20, 20, rightop:left: 50, mobile: {    gins = {
  chartMar
  constive respons margins -Chart // ;

 ge >= 0= stock.chanve nst isPositi}

  co    );
  </div>
    
       </div>  
 /p>...<art data ch>Loading400"xt-gray--600 dark:te"text-grayclassName=<p         ></div>
  4"auto mb--600 mx-rder-blue2 border-b- boh-12 w-12ounded-full spin ranimate-ame=" <div classN         center">
t-texassName="iv cl   <d    r">
 tify-centeenter jusms-c900 flex itek:bg-slate-0 dar-gray-5creen bg"min-h-same=sN clasiv<dn (
        retur {
  f (!stock)
  i);
gth]hartData.lenmeframe, cectedTisel, ck?.symbol}, [stoerval);
  Interval(int) => clear return (  ;

    }, 3000)
    });nt];
   1), newPois + (-maxPoint.sliceData [...prevrn       retu    
    30;
  0 :des('H') ? 5clue.indTimeframelecte  s               
        00 : n') ? 1ludes('miame.inctedTimefrelec = s maxPointsonst       c
      };
ice
   Prnewrice:       p  ),
  olume(0, v: Math.max  volume       Price,
 e: new     clos  ,
         low
    ,        highe,
  clos lastPoint.n:     ope
     + 1,oint.time ime: lastP          toint = {
DataPoint: Chartonst newP

        c) * 100000;() - 0.5(Math.random