'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import './style.css';

export default function Home() {
    const [text, setText] = useState('');
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState('');
    const [audioUrl, setAudioUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterCountry, setFilterCountry] = useState('');
    const [filterLanguage, setFilterLanguage] = useState('');

    // Fetch voices from voices.json on component mount
    useEffect(() => {
        async function fetchVoices() {
            try {
                const res = await fetch('/voices.json');
                if (!res.ok) throw new Error('Failed to fetch voices');
                const data = await res.json();
                setVoices(data);
                if (data.length > 0) {
                    setSelectedVoice(data[0].id);
                }
            } catch (error) {
                console.error('Error fetching voices:', error);
            }
        }
        fetchVoices();
    }, []);

    // Handle form submission to call TTS API
    async function handleSubmit(e) {
        e.preventDefault();
        if (!text.trim()) return;
        if (!selectedVoice) return;

        setLoading(true);
        setAudioUrl(null);

        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, voice: selectedVoice })
            });

            if (!response.ok) {
                throw new Error('TTS API request failed');
            }

            // Assuming the API returns audio as a blob
            const audioBlob = await response.blob();
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
        } catch (error) {
            console.error('Error generating audio:', error);
            alert('Failed to generate audio. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    // Filter voices based on search and filters
    const filteredVoices = voices.filter((voice) => {
        const matchesSearch =
            voice.artist.toLowerCase().includes(searchText.toLowerCase()) ||
            voice.id.toLowerCase().includes(searchText.toLowerCase());
        const matchesCountry = filterCountry ? voice.region === filterCountry : true;
        const matchesLanguage = filterLanguage ? voice.Language === filterLanguage : true;
        return matchesSearch && matchesCountry && matchesLanguage;
    });

    return (
        <>
            <Head>
                <title>LumaVoice - Text to Speech</title>
                <meta name="description" content="Convert text to speech with LumaVoice. Select from a variety of voices and generate audio easily." />
                <meta name="keywords" content="text to speech, TTS, voice synthesis, audio generation, speechma alternative, luvvoice alternative" />
                <meta name="author" content="LumaVoice" />
                <meta property="og:title" content="LumaVoice - Text to Speech" />
                <meta property="og:description" content="Convert text to speech with LumaVoice. Select from a variety of voices and generate audio easily." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://yourdomain.com" />
                <meta property="og:image" content="https://yourdomain.com/og-image.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="LumaVoice - Text to Speech" />
                <meta name="twitter:description" content="Convert text to speech with LumaVoice. Select from a variety of voices and generate audio easily." />
                <meta name="twitter:image" content="https://yourdomain.com/twitter-image.png" />
            </Head>
            <main className="main-container">
                <h1 className="heading">welcome to <span className="highlight">LumaVoice</span></h1>

                {/* Form container */}
                <section className="form-container">
                    <form onSubmit={handleSubmit} className="tts-form">
                        <textarea
                            placeholder="Enter text to synthesize"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="tts-input"
                            disabled={loading}
                            maxLength={20000}
                            required
                        />
                        <div className="char-counter">{text.length} / 20000</div>
                        <button type="submit" disabled={loading} className="tts-submit-button">
                            {loading ? 'Generating...' : 'Convert to Speech'}
                        </button>
                    </form>
                </section>

                {/* Voices list container */}
                <section className="voices-container">
                    <h3 className="selectvoicehead">Select a voice:</h3>
                    <div className="filter-container">
                        <input
                            type="text"
                            placeholder="Search voices"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="filter-input"
                        />
                        <select
                            value={filterCountry}
                            onChange={(e) => setFilterCountry(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Countries</option>
                            {[...new Set(voices.map((v) => v.region))].sort().map((region) => (
                                <option key={region} value={region}>
                                    {region}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filterLanguage}
                            onChange={(e) => setFilterLanguage(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Languages</option>
                            {[...new Set(voices.map((v) => v.Language))].sort().map((lang) => (
                                <option key={lang} value={lang}>
                                    {lang}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="voices-list">
                        {voices.length === 0 && <p>Loading voices...</p>}
                        {filteredVoices.length === 0 && <p>No voices match the filters.</p>}
                        {filteredVoices.map((voice) => (
                            <label key={voice.id} className="voice-card">
                                <input
                                    type="radio"
                                    name="voice"
                                    value={voice.id}
                                    checked={selectedVoice === voice.id}
                                    onChange={() => setSelectedVoice(voice.id)}
                                    disabled={loading}
                                    className="voice-radio"
                                />
                                <div className="voice-artist">{voice.artist}</div>
                                <div className="voice-tags">
                                    <span className="voice-tag">{voice.gender}</span>
                                    <span className="voice-tag">{voice.Language}</span>
                                    <span className="voice-tag">{voice.region}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Audio output container */}
                <section className="audio-container">
                    <h3 className="genaudio">Generated Audio:</h3>
                    {audioUrl ? (
                        <div>
                            <audio controls src={audioUrl} className="audio-player" />
                            <a
                                href={audioUrl}
                                download="tts-output.wav"
                                className="download-button"
                            >
                                Download
                            </a>
                        </div>
                    ) : (
                        <p className="noaudio">No audio generated yet...</p>
                    )}
                </section>
            </main>
        </>
    );
}
