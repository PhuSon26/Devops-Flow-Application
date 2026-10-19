import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CarFront, Check, ChevronDown, Heart, MapPin, Menu, Search, ShieldCheck, SlidersHorizontal, Gauge, Fuel, Settings2, X } from 'lucide-react'

type Car = { id:number; title:string; brand:string; year:number; priceVnd:number; mileageKm:number; transmission:string; fuel:string; location:string; imageUrl:string; seller:string; description:string; createdAt:string }
const API = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const money = (n:number) => n >= 1_000_000_000 ? `${(n/1_000_000_000).toFixed(2).replace(/0+$/,'').replace(/\.$/,'')} tỷ` : `${Math.round(n/1_000_000)} triệu`
const fmt = (n:number) => new Intl.NumberFormat('vi-VN').format(n)

export default function App() {
  const [cars,setCars] = useState<Car[]>([])
  const [query,setQuery] = useState('')
  const [brand,setBrand] = useState('Tất cả hãng')
  const [maxPrice,setMaxPrice] = useState('Tất cả mức giá')
  const [search,setSearch] = useState('')
  const [favorites,setFavorites] = useState<number[]>([])
  const [showForm,setShowForm] = useState(false)
  const [error,setError] = useState('')
  const [mobileNav,setMobileNav] = useState(false)
  const [form,setForm] = useState({title:'',brand:'Toyota',year:'2021',price:'450000000',mileageKm:'30000',transmission:'Tự động',fuel:'Xăng',location:'TP. Hồ Chí Minh',imageUrl:'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=85',seller:'Người bán XeHay',description:''})

  async function load() {
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('q',query.trim())
      if (brand !== 'Tất cả hãng') params.set('brand',brand)
      if (maxPrice !== 'Tất cả mức giá') params.set('maxPrice',maxPrice)
      const res = await fetch(`${API}/api/cars?${params}`)
      if (!res.ok) throw new Error('API error')
      setCars(await res.json()); setError('')
    } catch { setError('Chưa kết nối được API. Hãy chạy Spring Boot backend ở cổng 8080.') }
  }
  useEffect(() => { void load() }, [query,brand,maxPrice])
  const brands = ['Tất cả hãng','Toyota','Mazda','Honda','Ford','Hyundai','Mercedes-Benz']
  const visible = useMemo(() => cars.filter(c => `${c.title} ${c.brand} ${c.location}`.toLowerCase().includes(search.toLowerCase())), [cars,search])
  async function submitListing(e:React.FormEvent) {
    e.preventDefault()
    const payload = {...form,year:Number(form.year),priceVnd:Number(form.price),mileageKm:Number(form.mileageKm)}
    const res = await fetch(`${API}/api/cars`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
    if (res.ok) { setShowForm(false); setForm({...form,title:'',description:''}); await load() }
    else setError('Đăng tin chưa thành công. Kiểm tra dữ liệu và backend.')
  }
  function toggleFavorite(id:number) { setFavorites(prev => prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]) }

  return <div className="app">
    <header className="nav">
      <a className="logo" href="#"><span className="logo-mark"><CarFront size={23}/></span><span>XeHay<span className="logo-dot">.</span><small>CHỢ XE THÔNG MINH</small></span></a>
      <button className="mobile-menu" onClick={()=>setMobileNav(!mobileNav)}><Menu/></button>
      <nav className={mobileNav?'nav-links show':'nav-links'}><a className="nav-active" href="#cars">Mua xe</a><a href="#sell" onClick={()=>setShowForm(true)}>Bán xe</a><a href="#why">Kinh nghiệm mua xe</a></nav>
      <div className="nav-actions"><button className="login">Đăng nhập</button><button className="sell-btn" onClick={()=>setShowForm(true)}>＋ Đăng tin bán xe</button></div>
    </header>

    <section className="hero">
      <div className="hero-content">
        <div className="hero-kicker"><span></span> THỊ TRƯỜNG XE ĐÃ QUA SỬ DỤNG</div>
        <h1>Tìm chiếc xe<br/>phù hợp với <em>bạn.</em></h1>
        <p>Khám phá hàng ngàn lựa chọn xe chất lượng.<br/>Thông tin rõ ràng, quyết định tự tin.</p>
        <div className="hero-trust"><span><ShieldCheck size={16}/> Tin đăng minh bạch</span><span><Check size={16}/> Lựa chọn đa dạng</span></div>
      </div>
      <div className="hero-image"><img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1500&q=90" alt="Xe hơi trên đường"/><div className="image-overlay"></div><div className="hero-sticker"><b>01</b><span>CHỌN XE<br/>THEO CÁCH CỦA BẠN</span></div></div>
      <div className="hero-search">
        <div className="search-intro"><b>Bạn đang tìm xe gì?</b><span>Lọc theo nhu cầu của bạn</span></div>
        <label className="search-field"><CarFront size={18}/><select value={brand} onChange={e=>setBrand(e.target.value)}>{brands.map(b=><option key={b}>{b}</option>)}</select><ChevronDown size={14}/></label>
        <label className="search-field"><span className="currency">₫</span><select value={maxPrice} onChange={e=>setMaxPrice(e.target.value)}><option>Tất cả mức giá</option><option value="300000000">Dưới 300 triệu</option><option value="500000000">Dưới 500 triệu</option><option value="700000000">Dưới 700 triệu</option><option value="1000000000">Dưới 1 tỷ</option></select><ChevronDown size={14}/></label>
        <label className="search-field search-key"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nhập hãng xe, dòng xe..."/></label>
        <button className="search-btn" onClick={()=>{setSearch('');document.getElementById('cars')?.scrollIntoView({behavior:'smooth'})}}><Search size={17}/> Tìm xe</button>
      </div>
    </section>

    <main>
      <section className="benefits" id="why"><div><span className="benefit-icon"><ShieldCheck size={19}/></span><div><b>Thông tin rõ ràng</b><small>Chi tiết xe dễ theo dõi</small></div></div><div><span className="benefit-icon"><Check size={19}/></span><div><b>Nhiều lựa chọn</b><small>Đa dạng hãng và phân khúc</small></div></div><div><span className="benefit-icon"><Gauge size={19}/></span><div><b>So sánh dễ dàng</b><small>Giá, đời xe và số km</small></div></div></section>
      <section className="listings" id="cars">
        <div className="section-head"><div><div className="section-kicker">LỰA CHỌN DÀNH CHO BẠN</div><h2>Xe nổi bật <span>hôm nay.</span></h2><p>Những tin đăng đáng chú ý trên XeHay.</p></div><div className="listing-tools"><label className="quick-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm trong danh sách"/></label><button className="filter-btn" onClick={()=>{setBrand('Tất cả hãng');setMaxPrice('Tất cả mức giá');setQuery('');setSearch('')}}><SlidersHorizontal size={16}/> Xóa lọc</button></div></div>
        {error && <div className="error">{error}</div>}
        <div className="results-line"><span><b>{visible.length}</b> xe phù hợp</span><span>Sắp xếp: <b>Mới cập nhật <ChevronDown size={13}/></b></span></div>
        <div className="car-grid">{visible.map(car=><article className="car-card" key={car.id}>
          <div className="car-image"><img src={car.imageUrl} alt={car.title} loading="lazy"/><span className="car-tag">ĐÃ QUA SỬ DỤNG</span><button className={favorites.includes(car.id)?'favorite favorited':'favorite'} onClick={()=>toggleFavorite(car.id)} aria-label="Lưu xe"><Heart size={18} fill={favorites.includes(car.id)?'currentColor':'none'}/></button></div>
          <div className="car-info"><div className="car-brand">{car.brand} <span>•</span> {car.year}</div><h3>{car.title}</h3><div className="price">{money(car.priceVnd)} <small>VNĐ</small></div><div className="car-specs"><span><Gauge size={15}/>{fmt(car.mileageKm)} km</span><span><Settings2 size={15}/>{car.transmission}</span><span><Fuel size={15}/>{car.fuel}</span></div><div className="car-bottom"><span><MapPin size={14}/>{car.location}</span><button onClick={()=>alert(`${car.title}\nNgười bán: ${car.seller}\n\n${car.description}`)}>Chi tiết <ArrowRight size={15}/></button></div></div>
        </article>)}</div>
        {visible.length===0&&!error&&<div className="empty"><CarFront size={30}/><b>Chưa tìm thấy xe phù hợp</b><span>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</span></div>}
        <div className="load-more"><button onClick={()=>{setBrand('Tất cả hãng');setMaxPrice('Tất cả mức giá');setQuery('');setSearch('')}}>Xem tất cả xe <ArrowRight size={16}/></button></div>
      </section>
      <section className="sell-banner" id="sell"><div><div className="section-kicker">BẠN ĐANG CÓ XE MUỐN BÁN?</div><h2>Đưa chiếc xe của bạn<br/>đến đúng người mua.</h2><p>Tạo tin đăng nhanh chóng và tiếp cận người đang tìm xe.</p><button onClick={()=>setShowForm(true)}>Đăng tin miễn phí <ArrowRight size={16}/></button></div><div className="banner-graphic"><CarFront size={150}/><span>XeHay<span>.</span></span></div></section>
    </main>
    <footer><a className="logo footer-logo" href="#"><span className="logo-mark"><CarFront size={21}/></span><span>XeHay<span className="logo-dot">.</span><small>CHỢ XE THÔNG MINH</small></span></a><span>© 2026 XeHay. Project học tập full-stack & DevOps.</span><span>Minh bạch · Thuận tiện · Chủ động</span></footer>

    {showForm&&<div className="modal-backdrop" onClick={()=>setShowForm(false)}><form className="modal" onSubmit={submitListing} onClick={e=>e.stopPropagation()}><div className="modal-head"><div><div className="section-kicker">MARKETPLACE</div><h2>Đăng tin bán xe</h2></div><button type="button" className="close" onClick={()=>setShowForm(false)}><X/></button></div><div className="form-grid">
      <label className="wide">Tên tin đăng<input required maxLength={140} placeholder="VD: Toyota Vios G 1.5" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
      <label>Hãng xe<select value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})}>{brands.slice(1).map(b=><option key={b}>{b}</option>)}</select></label>
      <label>Năm sản xuất<input required type="number" min="1980" max="2026" value={form.year} onChange={e=>setForm({...form,year:e.target.value})}/></label>
      <label>Giá bán (VNĐ)<input required type="number" min="1" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label>
      <label>Số km đã đi<input required type="number" min="0" value={form.mileageKm} onChange={e=>setForm({...form,mileageKm:e.target.value})}/></label>
      <label>Hộp số<select value={form.transmission} onChange={e=>setForm({...form,transmission:e.target.value})}><option>Tự động</option><option>Số sàn</option></select></label>
      <label>Nhiên liệu<select value={form.fuel} onChange={e=>setForm({...form,fuel:e.target.value})}><option>Xăng</option><option>Diesel</option><option>Điện</option><option>Hybrid</option></select></label>
      <label>Khu vực<input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></label>
      <label>Người bán<input required value={form.seller} onChange={e=>setForm({...form,seller:e.target.value})}/></label>
      <label className="wide">URL ảnh xe<input required type="url" value={form.imageUrl} onChange={e=>setForm({...form,imageUrl:e.target.value})}/></label>
      <label className="wide">Mô tả<textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
    </div><div className="modal-actions"><button type="button" className="cancel" onClick={()=>setShowForm(false)}>Hủy</button><button type="submit" className="search-btn">Đăng tin xe <ArrowRight size={16}/></button></div></form></div>}
  </div>
}
