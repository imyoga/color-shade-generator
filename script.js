// Add event listeners when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    const colorInput = document.getElementById('colorInput');
    const colorPicker = document.getElementById('colorPicker');
    const generateButton = document.getElementById('generateButton');
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.querySelector('.error-message');
    const errorOkButton = document.getElementById('errorOkButton');
    const toggleButton = document.getElementById('toggleInput');
    const textInputWrapper = document.getElementById('textInputWrapper');
    const colorPickerWrapper = document.getElementById('colorPickerWrapper');
    const pickedColorCode = document.getElementById('pickedColorCode');

    // Set focus to input field on page load
    colorInput.focus();

    // Toggle between text input and color picker
    toggleButton.addEventListener('click', () => {
        textInputWrapper.classList.toggle('active');
        colorPickerWrapper.classList.toggle('active');
        toggleButton.classList.toggle('show-picker');
        
        if (colorPickerWrapper.classList.contains('active')) {
            colorPicker.click(); // Open color picker immediately
        } else {
            colorInput.focus(); // Focus text input when switching back
        }
    });

    // Update color code when color is picked
    colorPicker.addEventListener('input', (e) => {
        const colorValue = e.target.value.toUpperCase();
        pickedColorCode.textContent = colorValue;
        generateShades(colorValue);
    });

    // Event listener for the generate button
    generateButton.addEventListener('click', () => {
        if (textInputWrapper.classList.contains('active')) {
            generateShades();
        } else {
            generateShades(colorPicker.value.toUpperCase());
        }
    });

    // Event listener for Enter key on text input
    colorInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            generateShades();
        }
    });

    // Event listener for input to prevent long input
    colorInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '');
        if (value.length > 9) {
            e.target.value = value.slice(0, 9);
        }
    });

    // Event listener for error modal OK button
    errorOkButton.addEventListener('click', () => {
        errorModal.classList.remove('show');
        if (textInputWrapper.classList.contains('active')) {
            colorInput.focus();
        }
    });

    // Event listener for closing modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && errorModal.classList.contains('show')) {
            errorModal.classList.remove('show');
            if (textInputWrapper.classList.contains('active')) {
                colorInput.focus();
            }
        }
    });
});

function showError(message) {
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.querySelector('.error-message');
    const errorOkButton = document.getElementById('errorOkButton');
    
    errorMessage.textContent = message;
    errorModal.classList.add('show');
    errorOkButton.focus();
}

function isValidHex(color) {
    // Remove # if present and trim whitespace
    const hex = color.replace('#', '').trim();
    
    // Check for valid lengths (3, 6, or 8 characters)
    if (![3, 6, 8].includes(hex.length)) {
        return false;
    }
    
    // Check if all characters are valid hex
    return /^[0-9A-F]*$/i.test(hex);
}

function generateShades(colorValue) {
    let colorToUse = colorValue;
    
    if (!colorValue) {
        colorToUse = document.getElementById('colorInput').value.trim();
        if (!isValidHex(colorToUse)) {
            showError('Please enter a valid hex color code (e.g., #FFF, #FFFFFF, or #FFFFFFFF)');
            return;
        }
    }

    // Remove # if present
    colorToUse = colorToUse.replace('#', '');
    
    // Convert 3-digit hex to 6-digit hex if necessary
    if (colorToUse.length === 3) {
        colorToUse = colorToUse.split('').map(char => char + char).join('');
    }
    
    // Add # back
    const color = '#' + colorToUse.toUpperCase();
    const lighterShades = generateLighterShades(color, 10);
    const darkerShades = generateDarkerShades(color, 10);

    displayShades(lighterShades, 'lighterShades');
    displayShades(darkerShades, 'darkerShades');
}

function generateLighterShades(hexColor, count) {
    const shades = [];
    const rgb = hexToRgb(hexColor);
    
    for (let i = 1; i <= count; i++) {
        const factor = i / count;
        const lighter = {
            r: Math.round(rgb.r + (255 - rgb.r) * factor),
            g: Math.round(rgb.g + (255 - rgb.g) * factor),
            b: Math.round(rgb.b + (255 - rgb.b) * factor)
        };
        shades.push(rgbToHex(lighter));
    }
    return shades.reverse();
}

function generateDarkerShades(hexColor, count) {
    const shades = [];
    const rgb = hexToRgb(hexColor);
    
    for (let i = 1; i <= count; i++) {
        const factor = 1 - (i / count);
        const darker = {
            r: Math.round(rgb.r * factor),
            g: Math.round(rgb.g * factor),
            b: Math.round(rgb.b * factor)
        };
        shades.push(rgbToHex(darker));
    }
    return shades;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(rgb) {
    return '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1).toUpperCase();
}

function displayShades(shades, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    shades.forEach(shade => {
        const box = document.createElement('div');
        box.className = 'color-box';
        box.style.backgroundColor = shade;
        box.setAttribute('data-color', shade);
        
        // Create copy icon
        const copyIcon = document.createElement('div');
        copyIcon.className = 'copy-icon';
        copyIcon.innerHTML = '<i class="fas fa-copy"></i><i class="fas fa-check"></i>';
        
        // Create color code display
        const colorCode = document.createElement('div');
        colorCode.className = 'color-code';
        colorCode.textContent = shade;
        
        box.appendChild(copyIcon);
        box.appendChild(colorCode);
        
        box.onclick = (e) => {
            copyToClipboard(shade, copyIcon);
            
            // Add click effect class
            box.classList.add('clicked');
            setTimeout(() => {
                box.classList.remove('clicked');
            }, 200);
        };
        
        container.appendChild(box);
    });
}

function copyToClipboard(text, iconElement) {
    navigator.clipboard.writeText(text).then(() => {
        // Add the copied class to show check icon
        iconElement.classList.add('copied');
        
        // Remove the copied class after animation
        setTimeout(() => {
            iconElement.classList.remove('copied');
        }, 1500);
    });
}

function showCopiedTooltip(event) {
    const tooltip = document.createElement('div');
    tooltip.className = 'copied-tooltip';
    tooltip.textContent = 'Copied!';
    
    document.body.appendChild(tooltip);
    
    const rect = event.target.getBoundingClientRect();
    tooltip.style.top = rect.top - 30 + 'px';
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.opacity = '1';
    
    setTimeout(() => {
        tooltip.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(tooltip);
        }, 300);
    }, 1000);
}
