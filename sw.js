// PWA Banner စစ်ဆေးခြင်း
function checkAndShowBanner() {
    if (isStandalone) {
        if (autoBanner) autoBanner.classList.add('hidden');
        return;
    }
    if (sessionStorage.getItem('pwa_banner_dismissed')) {
        if (autoBanner) autoBanner.classList.add('hidden');
        return;
    }
    // deferredPrompt ရှိပါက အကောင့်ဝင်ထားသည်ဖြစ်စေ မဝင်ထားသည်ဖြစ်စေ ပြသပေးမည်
    const shouldShow = Boolean(deferredPrompt);
    if (autoBanner) autoBanner.classList.toggle('hidden', !shouldShow);
}

// Mobile Login Handler (Auto-lowercase & Trim)
async function handleLogin() {
    clearAuthErrors();
    const email = (document.getElementById('email').value || '').trim().toLowerCase();
    const password = document.getElementById('password').value || '';
    // ... signInWithEmailAndPassword ခေါ်ဆိုခြင်းနှင့် Error အား မြန်မာလို ဖော်ပြခြင်း
}
