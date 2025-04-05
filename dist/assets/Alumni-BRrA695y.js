import{r as l,j as e}from"./index-DGrjcYpl.js";import c from"./world-map-CAs4flhr.js";const r="/assets/nus-logo-DyGtQ-hF.png",m="/assets/UC-Berkeley-Symbol-D81RslWt.png",d="/assets/University_College_London_logo-D7e1OF-B.png",x="/assets/University_of_Cambridge-Logo-rosZbqfX.png",g="/assets/Imperial_College_London_new_logo-BSseZL6W.png",u="/assets/University_of_Hong_Kong-Logo-L8XSxHv3.png",h="/assets/University_of_Oxford-BLZ0Ero0.png",p="/assets/Hong_Kong_University_of_Science_and_Technology-Logo-BWA9ow57.png",f="/assets/cornell-university-1-logo-png-transparent-CT8ddOAo.png",v="/assets/University_of_Illinois_at_Urbana-Champaign_Wordmark.svg-C9tCDK0V.png",j="/assets/University_of_California__Los_Angeles_logo-BUoeWZDh.png",b="/assets/New_York_University-Logo-COgaxlCg.png",y=[{start:{lat:64.2008,lng:-149.4937},end:{lat:34.0522,lng:-118.2437}},{start:{lat:64.2008,lng:-149.4937},end:{lat:-15.7975,lng:-47.8919}},{start:{lat:-15.7975,lng:-47.8919},end:{lat:38.7223,lng:-9.1393}},{start:{lat:51.5074,lng:-.1278},end:{lat:28.6139,lng:77.209}},{start:{lat:28.6139,lng:77.209},end:{lat:43.1332,lng:131.9113}},{start:{lat:28.6139,lng:77.209},end:{lat:-1.2921,lng:36.8219}},{start:{lat:31.2304,lng:121.4737},end:{lat:-33.8688,lng:151.2093}},{start:{lat:31.2304,lng:121.4737},end:{lat:1.3521,lng:103.8198}}],i=[{label:"Countries",value:"11"},{label:"Alumni",value:"2500+"},{label:"Universities",value:"42"},{label:"Success Rate",value:"94%"}];let a=null;try{typeof document<"u"&&(a=document.createElement("div"),a.className="flex flex-col min-h-screen mx-10",a.innerHTML=`
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
        <div class="bg-white p-6">
          <h1 class="text-2xl font-bold mb-4 opacity-0">Alumni Network</h1>
          
          <div class="py-12 bg-white w-full mb-16">
            <div class="max-w-7xl mx-auto text-center">
              <h2 class="font-bold text-xl md:text-4xl text-black mb-8">
                Global Alumni Network
              </h2>
              
              <p class="text-sm md:text-lg text-neutral-500 max-w-2xl mx-auto pb-10">
                Our graduates are making an impact across the globe, 
                representing our school in prestigious universities worldwide.
              </p>
            </div>
            <div class="mt-8 h-96 bg-white"></div>
          </div>
          
          <div class="mt-8 mb-16">
            <h2 class="text-xl font-bold mb-10 text-center">Alumni Success Metrics</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              ${i.map(t=>`
                <div class="bg-white p-6 text-center">
                  <p class="text-3xl font-bold">${t.value}</p>
                  <p class="text-sm text-gray-500">${t.label}</p>
                </div>
              `).join("")}
            </div>
          </div>
          
          <div class="mt-16 mb-10">
            <h2 class="text-xl font-bold mb-10 text-center">Universities Our Alumni Attend</h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-10 items-center">
              ${[...Array(12)].map(()=>`
                <div class="flex justify-center items-center h-28 p-4 bg-gray-100/30">
                  <div class="w-full h-16 bg-gray-100"></div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `)}catch(t){console.error("Error prerendering Alumni component:",t)}const _=l.memo(()=>{const[t,n]=l.useState(!1);return l.useEffect(()=>{let s=setTimeout(()=>{n(!0)},50);return()=>clearTimeout(s)},[]),e.jsx("div",{className:"flex flex-col min-h-screen mx-10",children:e.jsx("div",{className:"max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full",children:e.jsxs("div",{className:"bg-white p-6",children:[e.jsx("h1",{className:`text-2xl font-bold mb-6 transition-opacity duration-300 ${t?"opacity-100":"opacity-0"}`,children:"Alumni Network"}),e.jsxs("div",{className:`py-12 bg-white w-full mb-16
            transition-opacity duration-500 ${t?"opacity-100":"opacity-0"}`,style:{transitionDelay:"100ms"},children:[e.jsxs("div",{className:"max-w-7xl mx-auto text-center",children:[e.jsx("h2",{className:"font-bold text-xl md:text-4xl text-black mb-8",children:"Global Alumni Network"}),e.jsx("p",{className:"text-sm md:text-lg text-neutral-500 max-w-2xl mx-auto pb-10",children:"Our graduates are making an impact across the globe, representing our school in prestigious universities worldwide."})]}),e.jsx("div",{className:"mt-8",children:e.jsx(c,{dots:y,lineColor:"#4caf50"})}),e.jsx("div",{className:"text-center mt-8",children:e.jsx("p",{className:"text-sm text-gray-500",children:"Join our global community of graduates"})})]}),e.jsxs("div",{className:"mt-8 mb-16",children:[e.jsx("h2",{className:"text-xl font-bold mb-10 text-center",children:"Alumni Success Metrics"}),e.jsx("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-8 mb-12",children:i.map((s,o)=>e.jsxs("div",{className:`bg-white p-6 text-center 
                    transition-all duration-300 ease-out hover:-translate-y-1
                    ${t?"opacity-100 translate-y-0":"opacity-0 translate-y-4"}`,style:{transitionDelay:`${300+o*50}ms`},children:[e.jsx("p",{className:"text-3xl font-bold text-black",children:s.value}),e.jsx("p",{className:"text-sm text-gray-500",children:s.label})]},s.label))})]}),e.jsxs("div",{className:"mt-16 mb-10",children:[e.jsx("h2",{className:"text-xl font-bold mb-10 text-center",children:"Universities Our Alumni Attend"}),e.jsxs("div",{className:`grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-10 items-center
              transition-opacity duration-500 ${t?"opacity-100":"opacity-0"}`,style:{transitionDelay:"500ms"},children:[e.jsx("div",{className:"flex justify-center items-center h-28 p-4",children:e.jsx("img",{src:h,alt:"University of Oxford",className:"max-h-full w-auto object-contain"})}),e.jsx("div",{className:"flex justify-center items-center h-28 p-4",children:e.jsx("img",{src:x,alt:"University of Cambridge",className:"max-h-full w-auto object-contain"})}),e.jsx("div",{className:"flex justify-center items-center h-28 p-4",children:e.jsx("img",{src:g,alt:"Imperial College London",className:"max-h-full w-auto object-contain"})}),e.jsx("div",{className:"flex justify-center items-center h-28 p-4",children:e.jsx("img",{src:d,alt:"University College London",className:"max-h-full w-auto object-contain"})}),e.jsx("div",{className:"flex justify-center items-center h-28 p-4",children:e.jsx("img",{src:r,alt:"National University of Singapore",className:"max-h-full w-auto object-contain"})}),e.jsx("div",{className:"flex justify-center items-center h-28 p-4",children:e.jsx("img",{src:m,alt:"UC Berkeley",className:"max-h-full w-auto object-contain"})}),e.jsx("div",{className:"flex justify-center items-center h-28 p-4",children:e.jsx("img",{src:u,alt:"University of Hong Kong",className:"max-h-full w-auto object-contain"})}),e.jsx("div",{className:"flex justify-center items-center h-28 p-4",children:e.jsx("img",{src:p,alt:"Hong Kong University of Science and Technology",className:"max-h-full w-auto object-contain"})}),e.jsx("div",{className:"flex justify-center items-center h-28 p-4",children:e.jsx("img",{src:j,alt:"UCLA",className:"max-h-full w-auto object-contain"})}),e.jsx("div",{className:"flex justify-center items-center h-28 p-4",children:e.jsx("img",{src:f,alt:"Cornell University",className:"max-h-full w-auto object-contain"})}),e.jsx("div",{className:"flex justify-center items-center h-28 p-4",children:e.jsx("img",{src:b,alt:"New York University",className:"max-h-full w-auto object-contain"})}),e.jsx("div",{className:"flex justify-center items-center h-28 p-4",children:e.jsx("img",{src:v,alt:"University of Illinois",className:"max-h-full w-auto object-contain"})})]})]})]})})})});export{_ as default};
