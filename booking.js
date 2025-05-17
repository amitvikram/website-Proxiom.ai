async function handleBookingSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const bookingData = {
        name: formData.get('name'),
        email: formData.get('email'),
        company: formData.get('company'),
        phone: formData.get('phone'),
        demoTime: formData.get('demoTime'),
        message: formData.get('message')
    };

    try {
        // Replace with your actual email service endpoint
        const response = await fetch('https://your-email-service.com/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: 'abc@gmail.com',
                subject: 'New Demo Booking Request',
                bookingData: bookingData
            })
        });

        if (response.ok) {
            alert('Demo request submitted successfully! We will contact you shortly.');
            event.target.reset();
        } else {
            throw new Error('Failed to submit booking');
        }
    } catch (error) {
        alert('Sorry, there was an error submitting your request. Please try again later.');
        console.error('Booking error:', error);
    }
} 