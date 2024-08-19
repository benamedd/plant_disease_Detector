document.getElementById('imageUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('uploadedImage');
            img.src = e.target.result;
            img.onload = function() {
                measureDiseaseSeverity(img);
            };
        }
        reader.readAsDataURL(file);
    }
});

document.getElementById('takePhoto').addEventListener('click', function() {
    const constraints = {
        video: { facingMode: 'environment' }
    };
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            const captureImage = function() {
                const canvas = document.getElementById('canvas');
                const context = canvas.getContext('2d');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const img = document.getElementById('cameraImage');
                img.src = canvas.toDataURL('image/png');
                img.onload = function() {
                    measureDiseaseSeverity(img);
                };
                stream.getTracks().forEach(track => track.stop());
                video.remove();
            };

            setTimeout(captureImage, 3000); // Capture after 3 seconds
        })
        .catch(function(err) {
            console.error('Error accessing the camera: ' + err);
        });
});

function measureDiseaseSeverity(img) {
    const src = cv.imread(img);
    const hsv = new cv.Mat();
    cv.cvtColor(src, hsv, cv.COLOR_RGB2HSV, 0);

    const healthyLower = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [35, 40, 40, 0]);
    const healthyUpper = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [85, 255, 255, 255]);
    const diseasedLower = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [10, 40, 40, 0]);
    const diseasedUpper = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [30, 255, 255, 255]);

    const healthyMask = new cv.Mat();
    const diseasedMask = new cv.Mat();
    cv.inRange(hsv, healthyLower, healthyUpper, healthyMask);
    cv.inRange(hsv, diseasedLower, diseasedUpper, diseasedMask);

    const healthyPixels = cv.countNonZero(healthyMask);
    const diseasedPixels = cv.countNonZero(diseasedMask);
    const totalPixels = src.rows * src.cols;

    const diseasedPercentage = (diseasedPixels / totalPixels) * 100;
    document.getElementById('result').innerText = `Disease severity: ${diseasedPercentage.toFixed(2)}%`;

    src.delete();
    hsv.delete();
    healthyLower.delete();
    healthyUpper.delete();
    diseasedLower.delete();
    diseasedUpper.delete();
    healthyMask.delete();
    diseasedMask.delete();
}
