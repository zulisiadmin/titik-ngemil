document.querySelector('#header').innerHTML=tnHeader();document.querySelector('#footer').innerHTML=tnFooter();
const fullMap=document.querySelector('#full-map');const favorites=[3,5,9,17,22];
const cards=TN.tenants.map((tenant,index)=>`<a class="booth is-occupied${favorites.includes(index+1)?' is-busy':''}" href="tenant-detail.html?slug=${tenant.slug}"><span class="booth-pin"></span><strong>${tenant.stallCode}</strong><small>${tenant.brand}</small></a>`);
cards.splice(12,0,`<div class="aisle">${TN_LANG==='en'?'Shared aisle and seating area':'Lorong utama & area duduk bersama'}</div>`);fullMap.innerHTML=cards.join('');
