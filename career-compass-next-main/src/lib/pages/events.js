import { supabase } from '../supabase';

let eventData = {
    title: "Event Not Found",
    shortDesc: "Details unavailable.",
    date: "--/--/----",
    location: "Unknown",
    description: "Please return to the events list.",
    mainImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80",
    gallery: [],
    video: null,
    highlights: [],
    whoShouldAttend: [],
    whatYouWillGain: [],
    isPassed: false
};

export async function initEventDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (eventId) {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('id', eventId)
                .single();

            if (error) {
                console.error("Error fetching event:", error);
            } else if (data) {
                const evtDate = new Date(data.date);
                const now = new Date();
                const isPassed = evtDate < now;

                eventData = {
                    title: data.title,
                    shortDesc: data.description.length > 100 ? data.description.substring(0, 100) + "..." : data.description,
                    date: evtDate.toLocaleDateString(),
                    location: data.location || "Online",
                    description: data.description,
                    mainImage: data.main_media_url || eventData.mainImage,
                    gallery: data.gallery_urls || [],
                    video: data.video_url,
                    highlights: data.key_highlights || [],
                    whoShouldAttend: data.who_should_attend || [],
                    whatYouWillGain: data.what_you_will_gain || [],
                    isPassed: isPassed
                };
            }
        } catch (err) {
            console.error("Unexpected fetch error:", err);
        }
    }

    renderEvent();
    setupModalListeners();
}

function renderEvent() {
    const titleEl = document.getElementById('event-title');
    const shortDescEl = document.getElementById('event-short-desc');
    const dateEl = document.getElementById('event-date');
    const locationEl = document.getElementById('event-location');
    const fullDescEl = document.getElementById('event-full-desc');
    const modalNameEl = document.getElementById('modal-event-name');

    if (titleEl) titleEl.textContent = eventData.title;
    if (shortDescEl) shortDescEl.textContent = eventData.shortDesc;
    if (dateEl) dateEl.textContent = eventData.date;
    if (locationEl) locationEl.textContent = eventData.location;
    if (fullDescEl) fullDescEl.innerHTML = `<p>${eventData.description}</p>`;
    if (modalNameEl) modalNameEl.textContent = eventData.title;

    const statusTag = document.getElementById('event-status-tag');
    const registerBtn = document.getElementById('open-register-btn');

    if (eventData.isPassed) {
        if (statusTag) {
            statusTag.textContent = "Passed Event";
            statusTag.style.backgroundColor = "#9ca3af";
        }
        if (registerBtn) {
            registerBtn.style.display = "none";
        }
    } else {
        if (statusTag) {
            statusTag.textContent = "Upcoming Event";
            statusTag.style.backgroundColor = "";
        }
        if (registerBtn) {
            registerBtn.style.display = "inline-block";
        }
    }

    const heroSection = document.getElementById('event-hero');
    if (heroSection) {
        heroSection.style.backgroundImage = `url('${eventData.mainImage}')`;
    }

    const galleryItems = document.querySelectorAll('.gallery-item .placeholder-img');
    if (eventData.gallery.length > 0) {
        eventData.gallery.forEach((url, index) => {
            if (galleryItems[index]) {
                galleryItems[index].innerHTML = `<img src="${url}" alt="Gallery ${index + 1}" style="width:100%; height:100%; object-fit:cover;">`;
            }
        });
    }

    renderList('event-highlights', eventData.highlights);
    renderList('who-attend-list', eventData.whoShouldAttend);
    renderList('gain-list', eventData.whatYouWillGain);

    if (eventData.video) {
        console.log("Video URL available:", eventData.video);
    }
}

function renderList(elementId, items) {
    const list = document.getElementById(elementId);
    if (!list) return;

    if (items && items.length > 0) {
        list.innerHTML = items.map(item => `<li>${item}</li>`).join('');
    } else {
        list.innerHTML = `<li style="opacity:0.5; font-style:italic;">Details to be announced.</li>`;
    }
}

function setupModalListeners() {
    const modal = document.getElementById('registration-modal');
    const openBtn = document.getElementById('open-register-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const form = document.getElementById('registration-form');

    const closeModal = () => {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    };

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = 'Registering...';
            submitBtn.disabled = true;

            const formData = new FormData(form);
            const urlParams = new URLSearchParams(window.location.search);
            const eventId = urlParams.get('id');

            const registrationPayload = {
                event_id: eventId,
                full_name: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                organization: formData.get('organization'),
                role: formData.get('role'),
                reason: formData.get('reason')
            };

            try {
                const { error } = await supabase
                    .from('event_registrations')
                    .insert([registrationPayload]);

                if (error) throw error;

                alert(`Success! ${registrationPayload.full_name}, you are registered for "${eventData.title}".`);
                form.reset();
                closeModal();

            } catch (err) {
                console.error("Registration failed:", err);
                alert("Registration failed. Please try again.");
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}