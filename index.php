<?php

$dataFile = __DIR__ . '/data/episodes.json';

if (!file_exists($dataFile)) {
    die('Die Datei data/episodes.json wurde nicht gefunden.');
}

$json = file_get_contents($dataFile);

try {
    $episodesData = json_decode(
        $json,
        true,
        512,
        JSON_THROW_ON_ERROR
    );
} catch (JsonException $e) {
    die('Fehler beim Lesen der Episoden-JSON: '
        . htmlspecialchars($e->getMessage()));
}

$episodes = $episodesData['episodes'] ?? [];

?>
<!DOCTYPE html>
<html lang="de">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0">

    <title>Japanisch lernen</title>

    <link
        rel="stylesheet"
        href="style.css">

</head>

<body>

    <div class="container">

        <header>

            <h1>🇯🇵 Japanisch lernen</h1>

            <p>Vokabeltrainer</p>

        </header>


        <main>

            <!-- Episoden-Auswahl -->

            <section class="settings">

                <label for="episodeSelect">
                    Episode auswählen
                </label>


                <select id="episodeSelect">

                    <?php if (empty($episodes)): ?>

                        <option value="">
                            Keine Episoden vorhanden
                        </option>

                    <?php else: ?>

                        <?php foreach ($episodes as $episode): ?>

                            <option
                                value="<?= htmlspecialchars($episode['file']) ?>">
                                <?= htmlspecialchars($episode['title']) ?>
                            </option>

                        <?php endforeach; ?>

                    <?php endif; ?>

                </select>


                <button
                    id="startButton"
                    class="primary-button">
                    Lernen starten
                </button>

            </section>


            <!-- Lernbereich -->

            <section
                id="quiz"
                class="quiz hidden">

                <div class="progress">

                    <div>

                        Frage

                        <strong id="currentQuestion">
                            1
                        </strong>

                        /

                        <strong id="totalQuestions">
                            0
                        </strong>

                    </div>


                    <div>

                        Punkte:

                        <strong id="score">
                            0
                        </strong>

                    </div>

                </div>


                <div class="question-card">

                    <div class="label">
                        Was bedeutet:
                    </div>


                    <div
                        id="japaneseWord"
                        class="japanese">
                        こんにちは
                    </div>

                </div>


                <div class="answer-area">

                    <label for="answer">
                        Deutsche Bedeutung
                    </label>


                    <input
                        type="text"
                        id="answer"
                        autocomplete="off"
                        placeholder="Deine Antwort...">


                    <button
                        id="checkButton"
                        class="primary-button">
                        Antwort prüfen
                    </button>

                </div>


                <!-- Ergebnis -->

                <div
                    id="result"
                    class="result hidden"></div>


                <button
                    id="nextButton"
                    class="secondary-button hidden">
                    Nächste Vokabel
                </button>

            </section>


            <!-- Ende -->

            <section
                id="finished"
                class="finished hidden">

                <h2>🎉 Fertig!</h2>

                <p>
                    Du hast die Runde abgeschlossen.
                </p>

                <div class="final-score">

                    <span id="finalScore">
                        0
                    </span>

                    Punkte

                </div>

                <!-- Falsch beantwortete Vokabeln -->

                <div
                    id="mistakesSection"
                    class="mistakes-section hidden">

                    <h3>📚 Das solltest du noch lernen</h3>

                    <p class="mistakes-intro">
                        Diese Vokabeln hast du in dieser Runde falsch beantwortet:
                    </p>

                    <div id="mistakesList"></div>

                </div>

                <button
                    id="restartButton"
                    class="primary-button">
                    Noch einmal
                </button>

            </section>

        </main>

    </div>


    <script src="script.js"></script>

</body>

</html>